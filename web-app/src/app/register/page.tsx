'use client';

import React, { useState } from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { Plus, MapPin, TreePine, Calendar, FileText, Save } from 'lucide-react';

function RegisterProjectContent() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: '',
    areaSize: '',
    estimatedCredits: '',
    vintage: '',
    developer: '',
    description: '',
    certificationStandard: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Project Registration Data:', formData);
    // TODO: Integrate with blockchain
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Plus className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Register Project</h1>
            <p className="text-gray-600">Register a new blue carbon project on the blockchain</p>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Project location"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Project Type *
              </label>
              <div className="relative">
                <TreePine className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select project type</option>
                  <option value="Mangrove Restoration">Mangrove Restoration</option>
                  <option value="Seagrass Conservation">Seagrass Conservation</option>
                  <option value="Wetland Protection">Wetland Protection</option>
                  <option value="Coastal Protection">Coastal Protection</option>
                  <option value="Salt Marsh Restoration">Salt Marsh Restoration</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="areaSize" className="block text-sm font-medium text-gray-700 mb-2">
                Area Size (hectares) *
              </label>
              <input
                type="number"
                id="areaSize"
                name="areaSize"
                value={formData.areaSize}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Area in hectares"
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="estimatedCredits" className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Credits *
              </label>
              <input
                type="number"
                id="estimatedCredits"
                name="estimatedCredits"
                value={formData.estimatedCredits}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Estimated carbon credits"
                min="1"
                required
              />
            </div>

            <div>
              <label htmlFor="vintage" className="block text-sm font-medium text-gray-700 mb-2">
                Vintage Year *
              </label>
              <div className="relative">
                <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  id="vintage"
                  name="vintage"
                  value={formData.vintage}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2024"
                  min="2020"
                  max="2030"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="developer" className="block text-sm font-medium text-gray-700 mb-2">
                Project Developer *
              </label>
              <input
                type="text"
                id="developer"
                name="developer"
                value={formData.developer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Organization name"
                required
              />
            </div>

            <div>
              <label htmlFor="certificationStandard" className="block text-sm font-medium text-gray-700 mb-2">
                Certification Standard *
              </label>
              <select
                id="certificationStandard"
                name="certificationStandard"
                value={formData.certificationStandard}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select standard</option>
                <option value="VCS">Verified Carbon Standard (VCS)</option>
                <option value="Gold Standard">Gold Standard</option>
                <option value="Climate Action Reserve">Climate Action Reserve</option>
                <option value="American Carbon Registry">American Carbon Registry</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <div className="relative">
              <FileText className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the project objectives, methodology, and expected outcomes..."
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Register Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterProjectPage() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <RegisterProjectContent />
      </Layout>
    </SolanaWalletProvider>
  );
}