'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CreditRetireData, TransactionResult } from '@/types';

interface CreditRetireFormProps {
  onSubmit: (data: CreditRetireData) => Promise<TransactionResult>;
  onCancel: () => void;
}

export default function CreditRetireForm({ onSubmit, onCancel }: CreditRetireFormProps) {
  const { connected, publicKey } = useWallet();
  const [formData, setFormData] = useState<CreditRetireData>({
    creditId: '',
    amount: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Reset form on success
        setFormData({
          creditId: '',
          amount: '',
          reason: '',
        });
      } else {
        setError(result.error || 'Transaction failed');
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Retire Carbon Credits</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="creditId" className="block text-sm font-medium text-gray-700 mb-2">
            Credit Token Address *
          </label>
          <input
            type="text"
            id="creditId"
            name="creditId"
            value={formData.creditId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="Enter the token mint address"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Retire (tonnes CO2) *
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
            placeholder="e.g., 50.25"
          />
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
            placeholder="Explain why these credits are being retired (e.g., corporate offset program, voluntary retirement)..."
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

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Retiring...' : 'Retire Credits'}
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

      <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Important</h3>
            <div className="mt-2 text-sm text-red-700">
              Retiring credits permanently removes them from circulation. This action cannot be undone.
              Only retire credits that have been used to offset actual carbon emissions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
