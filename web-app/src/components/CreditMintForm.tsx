'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CreditMintData, TransactionResult } from '@/types';

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
            disabled={loading || !connected}
            className="flex-1 bg-carbon-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-carbon-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <h3 className="text-sm font-medium text-blue-800">Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              Minting credits creates new carbon offset tokens based on verified environmental projects. 
              Ensure all verification documentation is accurate and complete.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
