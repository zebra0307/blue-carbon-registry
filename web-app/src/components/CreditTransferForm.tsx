'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CreditTransferData, TransactionResult } from '@/types';

interface CreditTransferFormProps {
  onSubmit: (data: CreditTransferData) => Promise<TransactionResult>;
  onCancel: () => void;
}

export default function CreditTransferForm({ onSubmit, onCancel }: CreditTransferFormProps) {
  const { connected, publicKey } = useWallet();
  const [formData, setFormData] = useState<CreditTransferData>({
    creditId: '',
    recipient: '',
    amount: '',
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
          recipient: '',
          amount: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transfer Carbon Credits</h2>
      
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter the token mint address"
          />
        </div>

        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Wallet Address *
          </label>
          <input
            type="text"
            id="recipient"
            name="recipient"
            value={formData.recipient}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter recipient's public key"
          />
        </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 100.50"
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
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Transferring...' : 'Transfer Credits'}
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

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
            <div className="mt-2 text-sm text-yellow-700">
              Double-check the recipient address before transferring. Transfers are irreversible and 
              tokens sent to an incorrect address cannot be recovered.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
