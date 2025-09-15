'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CreditRetireData, TransactionResult } from '@/types';

interface CreditRetireFormProps {
  onSubmit: (data: CreditRetireData) => Promise<TransactionResult>;
  onCancel: () => void;
  projects?: Array<{projectId: string; name: string; creditsIssued: number}>;
}

export default function CreditRetireForm({ onSubmit, onCancel, projects = [] }: CreditRetireFormProps) {
  const { connected, publicKey } = useWallet();
  const [formData, setFormData] = useState<CreditRetireData>({
    creditId: '',
    amount: '',
    reason: '',
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
      const result = await onSubmit(formData);
      
      if (result.success) {
        // Reset form and show success
        setFormData({
          creditId: '',
          amount: '',
          reason: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Retire Carbon Credits</h2>
      <p className="text-gray-600 mb-6">
        Permanently remove carbon credits from circulation to offset your carbon footprint.
        <span className="font-semibold text-red-600"> This action cannot be undone.</span>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="creditId" className="block text-sm font-medium text-gray-700 mb-2">
            Project *
          </label>
          <select
            id="creditId"
            name="creditId"
            value={formData.creditId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Select a project to retire credits from</option>
            {projects.map(project => (
              <option key={project.projectId} value={project.projectId}>
                {project.name} ({project.creditsIssued} credits available)
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Choose the project whose credits you want to retire
          </p>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (carbon credits) *
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="e.g., 10.50"
          />
          <p className="mt-1 text-sm text-gray-500">
            Number of carbon credits to permanently retire
          </p>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Retirement Reason *
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="e.g., 'Annual carbon footprint offset for 2025' or 'Company event carbon neutrality'"
          />
          <p className="mt-1 text-sm text-gray-500">
            Explain why you are retiring these credits (for record keeping)
          </p>
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
                <h3 className="text-sm font-medium text-green-800">Credits Retired Successfully!</h3>
                <div className="mt-2 text-sm text-green-700">
                  {successResult.creditsRetired && (
                    <p>Successfully retired {successResult.creditsRetired} carbon credits!</p>
                  )}
                  <p className="mt-1 font-medium">
                    🌱 Your carbon footprint has been offset. Thank you for protecting our planet!
                  </p>
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
                  {successResult.message && !successResult.creditsRetired && (
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
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Retiring...' : 'Retire Credits Permanently'}
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

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">⚠️ Important Notice</h3>
            <div className="mt-2 text-sm text-amber-700">
              Retiring carbon credits permanently removes them from circulation. This action cannot be undone.
              Retired credits serve as proof that you have offset your carbon emissions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
