'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import FunctionalHeader from '@/components/FunctionalHeader';
import ProjectForm from '@/components/ProjectForm';
import CreditMintForm from '@/components/CreditMintForm';
import CreditTransferForm from '@/components/CreditTransferForm';
import CreditRetireForm from '@/components/CreditRetireForm';
import { ProjectFormData, CreditMintData, CreditTransferData, CreditRetireData, TransactionResult } from '@/types';

export default function FunctionalDashboard() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock transaction handlers - replace with real blockchain calls
  const handleRegisterProject = async (data: ProjectFormData): Promise<TransactionResult> => {
    setLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Registering project:', data);
      
      // Mock success
      return {
        success: true,
        signature: 'mock_signature_' + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const handleMintCredits = async (data: CreditMintData): Promise<TransactionResult> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Minting credits:', data);
      
      return {
        success: true,
        signature: 'mock_mint_signature_' + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Minting failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const handleTransferCredits = async (data: CreditTransferData): Promise<TransactionResult> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Transferring credits:', data);
      
      return {
        success: true,
        signature: 'mock_transfer_signature_' + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const handleRetireCredits = async (data: CreditRetireData): Promise<TransactionResult> => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Retiring credits:', data);
      
      return {
        success: true,
        signature: 'mock_retire_signature_' + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Retirement failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to Blue Carbon Registry</h2>
        <p className="text-blue-100 text-lg">
          {connected 
            ? `Connected as ${publicKey?.toString().slice(0, 8)}...${publicKey?.toString().slice(-8)}`
            : 'Connect your wallet to start managing carbon credits on Solana'
          }
        </p>
        {!connected && (
          <div className="mt-4">
            <p className="text-blue-200">👆 Click "Select Wallet" in the header to get started</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">🏗️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">🪙</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credits Issued</p>
              <p className="text-2xl font-bold text-gray-900">156,420</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📤</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transferred</p>
              <p className="text-2xl font-bold text-gray-900">89,340</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Retired</p>
              <p className="text-2xl font-bold text-gray-900">45,680</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentPage('register')}
            disabled={!connected}
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🏗️</div>
              <div className="font-medium text-gray-900">Register Project</div>
              <div className="text-sm text-gray-600">Create new carbon project</div>
            </div>
          </button>

          <button
            onClick={() => setCurrentPage('mint')}
            disabled={!connected}
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🪙</div>
              <div className="font-medium text-gray-900">Mint Credits</div>
              <div className="text-sm text-gray-600">Create carbon tokens</div>
            </div>
          </button>

          <button
            onClick={() => setCurrentPage('transfer')}
            disabled={!connected}
            className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📤</div>
              <div className="font-medium text-gray-900">Transfer Credits</div>
              <div className="text-sm text-gray-600">Send to another wallet</div>
            </div>
          </button>

          <button
            onClick={() => setCurrentPage('retire')}
            disabled={!connected}
            className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="font-medium text-gray-900">Retire Credits</div>
              <div className="text-sm text-gray-600">Permanent offset claim</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!connected && ['register', 'mint', 'transfer', 'retire'].includes(currentPage)) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Connection Required</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to use this feature.</p>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      
      case 'register':
        return (
          <ProjectForm
            onSubmit={handleRegisterProject}
            onCancel={() => setCurrentPage('dashboard')}
          />
        );
      
      case 'mint':
        return (
          <CreditMintForm
            projectId="BCP-001"
            onSubmit={handleMintCredits}
            onCancel={() => setCurrentPage('dashboard')}
          />
        );
      
      case 'transfer':
        return (
          <CreditTransferForm
            onSubmit={handleTransferCredits}
            onCancel={() => setCurrentPage('dashboard')}
          />
        );
      
      case 'retire':
        return (
          <CreditRetireForm
            onSubmit={handleRetireCredits}
            onCancel={() => setCurrentPage('dashboard')}
          />
        );
      
      case 'projects':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Projects</h2>
            <p className="text-gray-600">Project management coming soon...</p>
          </div>
        );
      
      case 'credits':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Credits</h2>
            <p className="text-gray-600">Credit portfolio coming soon...</p>
          </div>
        );
      
      case 'marketplace':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketplace</h2>
            <p className="text-gray-600">Credit trading marketplace coming soon...</p>
          </div>
        );
      
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FunctionalHeader 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Processing transaction...</span>
            </div>
          </div>
        )}
        
        {renderContent()}
      </main>
    </div>
  );
}