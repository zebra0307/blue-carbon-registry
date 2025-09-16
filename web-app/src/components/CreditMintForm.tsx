'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CreditMintData, TransactionResult } from '@/types';
import { createProjectToken, mintCarbonCredits } from '@/utils/tokenService';

interface CreditMintFormProps {
  projectId: string;
  onSubmit: (data: CreditMintData) => Promise<TransactionResult>;
  onCancel: () => void;
}

export default function CreditMintForm({ projectId, onSubmit, onCancel }: CreditMintFormProps) {
  const { connected, publicKey } = useWallet();
  const [formData, setFormData] = useState<CreditMintData>({
    projectId,
    amount: '',
    verificationDate: '',
    verificationReport: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<TransactionResult | null>(null);
  const [tokenMintAddress, setTokenMintAddress] = useState<string | null>(null);
  const [tokenCreating, setTokenCreating] = useState(false);
  const [tokenMinting, setTokenMinting] = useState(false);

  // Create SPL Token for the project
  const handleCreateToken = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setTokenCreating(true);
    setError(null);

    try {
      const result = await createProjectToken(
        { publicKey, signTransaction: (window as any).solana?.signTransaction, connected },
        projectId
      );

      if (result.success && result.mintAddress) {
        setTokenMintAddress(result.mintAddress.toString());
        setError(null);
      } else {
        setError(result.error || 'Failed to create token');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create token');
    } finally {
      setTokenCreating(false);
    }
  };

  // Mint SPL tokens
  const handleMintTokens = async () => {
    if (!connected || !publicKey || !tokenMintAddress) {
      setError('Token not created yet or wallet not connected');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setTokenMinting(true);
    setError(null);

    try {
      const result = await mintCarbonCredits(
        { publicKey, signTransaction: (window as any).solana?.signTransaction, connected },
        projectId,
        amount * 100, // Convert to tokens with 2 decimals
        { toString: () => tokenMintAddress } as any // Mock PublicKey interface
      );

      if (result.success) {
        setError(null);
        // Continue with the original form submission
        return true;
      } else {
        setError(result.error || 'Failed to mint tokens');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint tokens');
      return false;
    } finally {
      setTokenMinting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Mint SPL tokens if token exists
      if (tokenMintAddress) {
        const tokenMintSuccess = await handleMintTokens();
        if (!tokenMintSuccess) {
          setLoading(false);
          return;
        }
      }

      // Step 2: Continue with original blockchain registration
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
        setSuccessResult(result);
        setError(null);
      } else {
        setError(result.error || 'Transaction failed');
        setSuccessResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mint Carbon Credits</h2>
      <p className="text-gray-600 mb-6">Project: <span className="font-medium">{projectId}</span></p>
      
      {/* SPL Token Setup Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">SPL Token Setup</h3>
        
        {!tokenMintAddress ? (
          <div>
            <p className="text-blue-800 mb-3">
              First, create an SPL token for this project's carbon credits.
            </p>
            <button
              type="button"
              onClick={handleCreateToken}
              disabled={tokenCreating || !connected}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tokenCreating ? 'Creating Token...' : 'Create Carbon Credit Token'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-green-800 mb-2">✅ Token created successfully!</p>
            <p className="text-sm text-gray-600 break-all">
              Mint Address: <span className="font-mono">{tokenMintAddress}</span>
            </p>
          </div>
        )}
      </div>
      
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-carbon-green-500 focus:border-carbon-green-500"
            placeholder="e.g., 1000.50"
          />
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
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
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
            disabled={loading || !connected || tokenCreating || tokenMinting}
            className="flex-1 bg-carbon-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-carbon-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading || tokenMinting ? 'Minting...' : 'Mint Credits'}
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
