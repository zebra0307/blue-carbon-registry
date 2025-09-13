'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { ProjectFormData, TransactionResult } from '@/types';

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<TransactionResult>;
  onCancel: () => void;
}

export default function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const { connected, publicKey } = useWallet();
  const [formData, setFormData] = useState<ProjectFormData>({
    projectId: '',
    name: '',
    description: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        // Reset form on success
        setFormData({
          projectId: '',
          name: '',
          description: '',
          location: '',
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New Project</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
            Project ID *
          </label>
          <input
            type="text"
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ocean-blue-500 focus:border-ocean-blue-500"
            placeholder="e.g., BCP-002"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ocean-blue-500 focus:border-ocean-blue-500"
            placeholder="e.g., Mangrove Restoration Project"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ocean-blue-500 focus:border-ocean-blue-500"
            placeholder="Describe your carbon offset project..."
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ocean-blue-500 focus:border-ocean-blue-500"
            placeholder="e.g., Pacific Coast, California"
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
            className="flex-1 bg-ocean-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-ocean-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Registering...' : 'Register Project'}
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
    </div>
  );
}
