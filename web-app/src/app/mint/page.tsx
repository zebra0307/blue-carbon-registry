'use client';

import React, { useState } from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { Coins, TreePine, Award, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAllProjects } from '@/hooks/useBlockchainData';

function MintCreditsContent() {
  const [selectedProject, setSelectedProject] = useState('');
  const [creditsToMint, setCreditsToMint] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const { projects, loading, error } = useAllProjects();

  const handleMint = () => {
    // TODO: Integrate with blockchain
    console.log('Minting credits:', {
      project: selectedProject,
      amount: creditsToMint
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Coins className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mint Credits</h1>
            <p className="text-gray-600">Issue verified carbon credits on the blockchain</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading projects: {error}
        </div>
      )}

      {/* Project Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Verified Project</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => (project.status === 'Verified' || project.verified) && setSelectedProject(project.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedProject === project.id
                  ? 'border-green-500 bg-green-50'
                  : (project.status === 'Verified' || project.verified)
                  ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  (project.status === 'Verified' || project.verified)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {(project.status === 'Verified' || project.verified) ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {project.verified ? 'Verified' : project.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Available to Mint:</span>
                  <span className="font-medium text-green-600">{project.creditsAvailable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credits Issued:</span>
                  <span className="font-medium">{project.creditsIssued.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mint Configuration */}
      {selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mint Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="creditsToMint" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Credits to Mint
              </label>
              <input
                type="number"
                id="creditsToMint"
                value={creditsToMint}
                onChange={(e) => setCreditsToMint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter number of credits"
                min="1"
                max={projects.find(p => p.id === selectedProject)?.creditsAvailable}
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum available: {projects.find(p => p.id === selectedProject)?.creditsAvailable.toLocaleString()} credits
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Transaction Fee
              </label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Solana Network Fee:</span>
                  <span className="font-medium">~0.000005 SOL</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">Platform Fee:</span>
                  <span className="font-medium">2.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mint Preview */}
          {creditsToMint && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Mint Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Credits to Mint:</span>
                  <span className="font-medium text-green-900">{parseInt(creditsToMint).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Platform Fee (2.5%):</span>
                  <span className="font-medium text-green-900">{Math.round(parseInt(creditsToMint) * 0.025).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-green-300 pt-2">
                  <span className="text-green-700 font-medium">Net Credits Minted:</span>
                  <span className="font-bold text-green-900">{Math.round(parseInt(creditsToMint) * 0.975).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setSelectedProject('')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMint}
              disabled={!creditsToMint || parseInt(creditsToMint) <= 0}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Zap className="h-4 w-4" />
              <span>Mint Credits</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Award className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Credit Minting Process</h4>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• Only verified projects can mint credits</li>
              <li>• Credits are issued as SPL tokens on Solana</li>
              <li>• Each credit represents 1 tonne of CO₂ equivalent</li>
              <li>• All minting transactions are recorded on-chain</li>
              <li>• Minted credits can be transferred or retired</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MintCreditsPage() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <MintCreditsContent />
      </Layout>
    </SolanaWalletProvider>
  );
}