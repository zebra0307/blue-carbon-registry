'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { CreditMintData, TransactionResult } from '@/types';
import { 
  mintVerifiedCredits, 
  getCarbonTokenBalance, 
  getProjectData,
  getGlobalRegistryData 
} from '@/utils/solana';

interface CreditMintFormProps {
  projectId: string;
  onSubmit: (data: CreditMintData) => Promise<TransactionResult>;
  onCancel: () => void;
}

interface ProjectVerificationStatus {
  isVerified: boolean;
  verifiedAmount: number;
  alreadyMinted: number;
  remainingCapacity: number;
}

interface TokenBalanceInfo {
  balance: number;
  tokenAccount: string;
  loading: boolean;
}

export default function CreditMintForm({ projectId, onSubmit, onCancel }: CreditMintFormProps) {
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  
  const [formData, setFormData] = useState<CreditMintData>({
    projectId,
    amount: '',
    verificationDate: '',
    verificationReport: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'wallet' | 'network' | 'validation' | 'unknown' | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [successResult, setSuccessResult] = useState<TransactionResult | null>(null);
  
  // Token-specific states
  const [verificationStatus, setVerificationStatus] = useState<ProjectVerificationStatus | null>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalanceInfo>({
    balance: 0,
    tokenAccount: '',
    loading: true
  });
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [transactionSignature, setTransactionSignature] = useState<string>('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Load project verification status and token balance
  useEffect(() => {
    if (connected && publicKey) {
      loadProjectStatus();
      loadTokenBalance();
    }
  }, [connected, publicKey, projectId]);

  // Real-time balance polling
  useEffect(() => {
    if (!connected || !publicKey) return;

    const pollInterval = setInterval(() => {
      loadTokenBalance();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [connected, publicKey]);

  // Real-time transaction status updates
  useEffect(() => {
    if (transactionStatus && transactionStatus.includes('confirmed')) {
      // Auto-refresh data after successful transaction
      const refreshTimeout = setTimeout(() => {
        loadProjectStatus();
        loadTokenBalance();
      }, 2000);

      return () => clearTimeout(refreshTimeout);
    }
  }, [transactionStatus]);

  // Enhanced error handling with categorization
  const setErrorWithType = (message: string, type: 'wallet' | 'network' | 'validation' | 'unknown' = 'unknown') => {
    setError(message);
    setErrorType(type);
  };

  const isRetryableError = (errorType: string | null): boolean => {
    return errorType === 'network' || errorType === 'unknown';
  };

  const getErrorMessage = (err: any): { message: string; type: 'wallet' | 'network' | 'validation' | 'unknown' } => {
    const errorString = err instanceof Error ? err.message : String(err);
    
    // Wallet-related errors
    if (errorString.includes('wallet') || errorString.includes('not connected') || errorString.includes('unauthorized')) {
      return { message: errorString, type: 'wallet' };
    }
    
    // Network/RPC errors
    if (errorString.includes('network') || errorString.includes('RPC') || errorString.includes('timeout') || 
        errorString.includes('fetch') || errorString.includes('connection')) {
      return { message: 'Network error. Please check your connection and try again.', type: 'network' };
    }
    
    // Validation errors
    if (errorString.includes('amount') || errorString.includes('verified') || errorString.includes('capacity') ||
        errorString.includes('invalid') || errorString.includes('insufficient')) {
      return { message: errorString, type: 'validation' };
    }
    
    // Default to unknown
    return { message: errorString, type: 'unknown' };
  };

  const loadProjectStatus = async () => {
    if (!publicKey) return;
    
    try {
      // Get project data to check verification status
      const projectData = await getProjectData(wallet, publicKey, projectId);
      
      if (projectData.success && projectData.data) {
        const project = projectData.data;
        setVerificationStatus({
          isVerified: project.verificationStatus === 'Verified',
          verifiedAmount: project.carbonTonsEstimated || 0,
          alreadyMinted: project.tokensMinted || 0,
          remainingCapacity: (project.carbonTonsEstimated || 0) - (project.tokensMinted || 0)
        });
      } else {
        const errorInfo = getErrorMessage(projectData.error || 'Failed to load project data');
        setErrorWithType(errorInfo.message, errorInfo.type);
      }
    } catch (err) {
      console.error('Error loading project status:', err);
      const errorInfo = getErrorMessage(err);
      setErrorWithType(`Failed to load project status: ${errorInfo.message}`, errorInfo.type);
    }
  };

  const loadTokenBalance = async () => {
    if (!publicKey) return;
    
    setTokenBalance(prev => ({ ...prev, loading: true }));
    
    try {
      const balanceResult = await getCarbonTokenBalance(wallet, publicKey);
      
      if (balanceResult.success) {
        setTokenBalance({
          balance: balanceResult.balance || 0,
          tokenAccount: balanceResult.tokenAccount || '',
          loading: false
        });
        setLastUpdateTime(new Date());
      } else {
        const errorInfo = getErrorMessage(balanceResult.error || 'Failed to load token balance');
        setErrorWithType(`Failed to load token balance: ${errorInfo.message}`, errorInfo.type);
        setTokenBalance(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Error loading token balance:', err);
      const errorInfo = getErrorMessage(err);
      setErrorWithType(`Failed to load token balance: ${errorInfo.message}`, errorInfo.type);
      setTokenBalance(prev => ({ ...prev, loading: false }));
    }
  };

  // Mint verified carbon credits using the global token system
  const handleMintVerifiedCredits = async (amount: number, isRetry: boolean = false): Promise<boolean> => {
    if (!connected || !publicKey) {
      setErrorWithType('Please connect your wallet first', 'wallet');
      return false;
    }

    if (!verificationStatus?.isVerified) {
      setErrorWithType('Project must be verified before minting credits', 'validation');
      return false;
    }

    if (amount > verificationStatus.remainingCapacity) {
      setErrorWithType(`Cannot mint ${amount} credits. Only ${verificationStatus.remainingCapacity} credits remaining.`, 'validation');
      return false;
    }

    if (isRetry) {
      setIsRetrying(true);
      setTransactionStatus('Retrying transaction...');
    } else {
      setTransactionStatus('Preparing transaction...');
    }
    
    try {
      setTransactionStatus('Sending transaction to Solana network...');
      
      const result = await mintVerifiedCredits(
        wallet,
        projectId,
        amount,
        publicKey // Mint to project owner
      );

      if (result.success) {
        setTransactionStatus('Transaction confirmed!');
        setTransactionSignature(result.transaction || '');
        setLastUpdateTime(new Date());
        setError(null);
        setErrorType(null);
        setRetryCount(0);
        
        // Show success for a moment then auto-refresh
        setTimeout(() => {
          setTransactionStatus('Refreshing data...');
        }, 1500);
        
        // Refresh data
        await loadProjectStatus();
        await loadTokenBalance();
        
        setTransactionStatus('');
        return true;
      } else {
        const errorInfo = getErrorMessage(result.error || 'Failed to mint credits');
        setErrorWithType(errorInfo.message, errorInfo.type);
        return false;
      }
    } catch (err) {
      console.error('Mint error:', err);
      const errorInfo = getErrorMessage(err);
      setErrorWithType(errorInfo.message, errorInfo.type);
      return false;
    } finally {
      setTransactionStatus('');
      setIsRetrying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      setErrorWithType('Please connect your wallet first', 'wallet');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setErrorWithType('Please enter a valid amount', 'validation');
      return;
    }

    if (!verificationStatus?.isVerified) {
      setErrorWithType('Project must be verified before minting credits', 'validation');
      return;
    }

    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      // Mint verified credits directly using the global token system
      const mintSuccess = await handleMintVerifiedCredits(amount);
      
      if (mintSuccess) {
        // Call the original onSubmit for any additional processing
        const result = await onSubmit({
          ...formData,
          amount: formData.amount,
        });
        
        if (result.success) {
          // Reset form and show success
          setFormData({
            projectId,
            amount: '',
            verificationDate: '',
            verificationReport: '',
          });
          setSuccessResult({
            success: true,
            signature: result.signature,
            message: `Successfully minted ${amount} carbon credits!`,
            creditsIssued: amount
          });
          setError(null);
          setErrorType(null);
        } else {
          const errorInfo = getErrorMessage(result.error || 'Additional processing failed');
          setErrorWithType(errorInfo.message, errorInfo.type);
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      const errorInfo = getErrorMessage(err);
      setErrorWithType(errorInfo.message, errorInfo.type);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRetry = async () => {
    if (!isRetryableError(errorType) || retryCount >= 3) {
      return;
    }

    setRetryCount(prev => prev + 1);
    setError(null);
    setErrorType(null);
    
    if (formData.amount) {
      const amount = parseFloat(formData.amount);
      if (!isNaN(amount) && amount > 0) {
        await handleMintVerifiedCredits(amount, true);
      }
    }
  };

  const handleClearError = () => {
    setError(null);
    setErrorType(null);
    setRetryCount(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mint Carbon Credits</h2>
      <p className="text-gray-600 mb-6">Project: <span className="font-medium">{projectId}</span></p>
      
      {/* Project Verification Status */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Project Verification Status</h3>
          {verificationStatus && (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          )}
        </div>
        
        {verificationStatus ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Verification Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                verificationStatus.isVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {verificationStatus.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
              </span>
            </div>
            
            {verificationStatus.isVerified && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Verified Capacity:</span>
                  <span className="text-sm text-gray-900">{verificationStatus.verifiedAmount.toLocaleString()} tons CO2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Already Minted:</span>
                  <span className="text-sm text-gray-900">{verificationStatus.alreadyMinted.toLocaleString()} tokens</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Remaining Capacity:</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-600">{verificationStatus.remainingCapacity.toLocaleString()} tokens</span>
                    <div className="mt-1 w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (verificationStatus.remainingCapacity / verificationStatus.verifiedAmount) * 100))}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {lastUpdateTime && (
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {lastUpdateTime.toLocaleTimeString()}
              </p>
            )}
          </div>
        ) : (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        )}
      </div>

      {/* Current Token Balance */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Your Token Balance</h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
        
        {tokenBalance.loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Carbon Credits:</span>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-600">
                  {tokenBalance.balance.toLocaleString()} tokens
                </span>
                {lastUpdateTime && (
                  <p className="text-xs text-gray-500">
                    Updated: {lastUpdateTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            {tokenBalance.tokenAccount && (
              <p className="text-xs text-gray-500 break-all">
                Token Account: {tokenBalance.tokenAccount}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Transaction Status */}
      {transactionStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-blue-800 text-sm font-medium">
                {transactionStatus}
              </p>
            </div>
            {lastUpdateTime && (
              <p className="text-xs text-blue-600">
                {lastUpdateTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          {transactionSignature && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Transaction:</strong>{' '}
                <a 
                  href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline font-mono"
                >
                  {transactionSignature.slice(0, 8)}...{transactionSignature.slice(-8)}
                </a>
              </p>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (tonnes CO2) *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            required
            min="0.01"
            step="0.01"
            max={verificationStatus?.remainingCapacity || undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter amount of carbon credits to mint"
            disabled={!verificationStatus?.isVerified}
          />
          {verificationStatus && !verificationStatus.isVerified && (
            <p className="text-xs text-red-600 mt-1">
              Project must be verified before minting credits
            </p>
          )}
          {verificationStatus?.isVerified && verificationStatus.remainingCapacity <= 0 && (
            <p className="text-xs text-red-600 mt-1">
              No remaining capacity for this project
            </p>
          )}
        </div>

        <div>
          <label htmlFor="verificationDate" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Date *
          </label>
          <input
            type="date"
            id="verificationDate"
            name="verificationDate"
            value={formData.verificationDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-carbon-green-500 focus:border-carbon-green-500"
          />
        </div>

        <div>
          <label htmlFor="verificationReport" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Report *
          </label>
          <textarea
            id="verificationReport"
            name="verificationReport"
            value={formData.verificationReport}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-carbon-green-500 focus:border-carbon-green-500"
            placeholder="Provide details of the verification process and results..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  {errorType === 'wallet' ? 'Wallet Error' : 
                   errorType === 'network' ? 'Network Error' : 
                   errorType === 'validation' ? 'Validation Error' : 'Error'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  {retryCount > 0 && (
                    <p className="mt-1 text-xs">Retry attempt {retryCount}/3</p>
                  )}
                </div>
                <div className="mt-3 flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClearError}
                    className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    Dismiss
                  </button>
                  {isRetryableError(errorType) && retryCount < 3 && !isRetrying && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {isRetrying ? 'Retrying...' : 'Retry'}
                    </button>
                  )}
                  {errorType === 'network' && (
                    <button
                      type="button"
                      onClick={() => {
                        loadProjectStatus();
                        loadTokenBalance();
                      }}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Refresh Data
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {successResult && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <div className="mt-2 text-sm text-green-700">
                  {successResult.creditsIssued && (
                    <p>Successfully minted {successResult.creditsIssued} carbon credits!</p>
                  )}
                  {successResult.mintAddress && (
                    <p className="mt-1">
                      <strong>Mint Address:</strong> {successResult.mintAddress}
                    </p>
                  )}
                  {successResult.signature && (
                    <p className="mt-1">
                      <strong>Transaction:</strong> 
                      <a 
                        href={`https://explorer.solana.com/tx/${successResult.signature}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 text-green-600 hover:text-green-500 underline"
                      >
                        {successResult.signature.slice(0, 8)}...{successResult.signature.slice(-8)}
                      </a>
                    </p>
                  )}
                  {successResult.message && !successResult.creditsIssued && (
                    <p>{successResult.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || !connected || !verificationStatus?.isVerified || (verificationStatus?.remainingCapacity || 0) <= 0}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Minting...' : 'Mint Credits'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Enhanced Minting Process</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">This enhanced minting process includes:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>SPL Token creation for liquid carbon credits</li>
                <li>Blockchain registration with verification data</li>
                <li>Mint authority managed by program smart contract</li>
                <li>Full traceability and transparency</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
