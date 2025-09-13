'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ProjectForm from './ProjectForm';
import CreditMintForm from './CreditMintForm';
import CreditTransferForm from './CreditTransferForm';
import CreditRetireForm from './CreditRetireForm';
import { ProjectFormData, CreditMintData, CreditTransferData, CreditRetireData, TransactionResult } from '@/types';

export default function FunctionalDashboard() {
  const { connected, publicKey } = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Debug logging
  console.log('Dashboard state:', { connected, activeSection, publicKey: publicKey?.toString() });

  // Mock transaction handlers with better feedback
  const handleProjectSubmit = async (data: ProjectFormData): Promise<TransactionResult> => {
    console.log('Registering project:', data);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, signature: 'mock_signature_' + Date.now() };
    } catch (error) {
      return { success: false, error: 'Failed to register project' };
    }
  };

  const handleMintSubmit = async (data: CreditMintData): Promise<TransactionResult> => {
    console.log('Minting credits:', data);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, signature: 'mock_signature_' + Date.now() };
    } catch (error) {
      return { success: false, error: 'Failed to mint credits' };
    }
  };

  const handleTransferSubmit = async (data: CreditTransferData): Promise<TransactionResult> => {
    console.log('Transferring credits:', data);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, signature: 'mock_signature_' + Date.now() };
    } catch (error) {
      return { success: false, error: 'Failed to transfer credits' };
    }
  };

  const handleRetireSubmit = async (data: CreditRetireData): Promise<TransactionResult> => {
    console.log('Retiring credits:', data);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, signature: 'mock_signature_' + Date.now() };
    } catch (error) {
      return { success: false, error: 'Failed to retire credits' };
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'register':
        return (
          <ProjectForm
            onSubmit={handleProjectSubmit}
            onCancel={() => setActiveSection('dashboard')}
          />
        );
      case 'mint':
        return (
          <CreditMintForm
            projectId="BCP-001"
            onSubmit={handleMintSubmit}
            onCancel={() => setActiveSection('dashboard')}
          />
        );
      case 'transfer':
        return (
          <CreditTransferForm
            onSubmit={handleTransferSubmit}
            onCancel={() => setActiveSection('dashboard')}
          />
        );
      case 'retire':
        return (
          <CreditRetireForm
            onSubmit={handleRetireSubmit}
            onCancel={() => setActiveSection('dashboard')}
          />
        );
      case 'projects':
        return renderProjectsView();
      case 'marketplace':
        return renderMarketplaceView();
      case 'analytics':
        return renderAnalyticsView();
      default:
        return renderDashboardView();
    }
  };

  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h2 className="text-3xl font-bold mb-2">Welcome to Blue Carbon Registry</h2>
        <p className="text-blue-100 text-lg">
          Manage carbon credits from blue carbon ecosystems on the Solana blockchain.
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm">
              {connected ? `Connected: ${publicKey?.toString().slice(0, 8)}...` : 'Wallet Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">🏗️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 number-animate">15</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">🪙</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credits Issued</p>
              <p className="text-3xl font-bold text-gray-900 number-animate">125.4K</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">📤</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transferred</p>
              <p className="text-3xl font-bold text-gray-900 number-animate">42.8K</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Retired</p>
              <p className="text-3xl font-bold text-gray-900 number-animate">28.6K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="action-grid">
          <button
            onClick={() => connected ? setActiveSection('register') : null}
            disabled={!connected}
            className={`action-card bg-green-50 border-green-200 hover:border-green-300 hover:bg-green-100 ${!connected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-4xl mb-2 block icon-bounce">🏗️</span>
            <h4 className="font-semibold text-green-800">Register Project</h4>
            <p className="text-sm text-green-600 mt-1">Add new carbon project</p>
            {!connected && <div className="absolute top-2 right-2">🔒</div>}
          </button>

          <button
            onClick={() => connected ? setActiveSection('mint') : null}
            disabled={!connected}
            className={`action-card bg-blue-50 border-blue-200 hover:border-blue-300 hover:bg-blue-100 ${!connected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-4xl mb-2 block icon-bounce">🪙</span>
            <h4 className="font-semibold text-blue-800">Mint Credits</h4>
            <p className="text-sm text-blue-600 mt-1">Issue new carbon credits</p>
            {!connected && <div className="absolute top-2 right-2">🔒</div>}
          </button>

          <button
            onClick={() => connected ? setActiveSection('transfer') : null}
            disabled={!connected}
            className={`action-card bg-yellow-50 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-100 ${!connected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-4xl mb-2 block icon-bounce">📤</span>
            <h4 className="font-semibold text-yellow-800">Transfer Credits</h4>
            <p className="text-sm text-yellow-600 mt-1">Send credits to others</p>
            {!connected && <div className="absolute top-2 right-2">🔒</div>}
          </button>

          <button
            onClick={() => connected ? setActiveSection('retire') : null}
            disabled={!connected}
            className={`action-card bg-red-50 border-red-200 hover:border-red-300 hover:bg-red-100 ${!connected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-4xl mb-2 block icon-bounce">🔥</span>
            <h4 className="font-semibold text-red-800">Retire Credits</h4>
            <p className="text-sm text-red-600 mt-1">Permanently retire credits</p>
            {!connected && <div className="absolute top-2 right-2">🔒</div>}
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section activity-section">
        <div className="activity-header">
          <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600 mt-1">Latest transactions and updates</p>
        </div>
        <div className="activity-list">
          <div className="activity-card new">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏗️</span>
                <div>
                  <p className="font-medium text-gray-900">Mangrove Restoration Project Registered</p>
                  <p className="text-sm text-gray-600">Pacific Coast, California</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">New</span>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
          </div>

          <div className="activity-card minted">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🪙</span>
                <div>
                  <p className="font-medium text-gray-900">5,000 Credits Minted</p>
                  <p className="text-sm text-gray-600">Seagrass Meadow Project #007</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Minted</span>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>

          <div className="activity-card transferred">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📤</span>
                <div>
                  <p className="font-medium text-gray-900">1,200 Credits Transferred</p>
                  <p className="text-sm text-gray-600">To wallet: 8x9K...mP3q</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Transfer</span>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
            </div>
          </div>

          <div className="activity-card retired">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-medium text-gray-900">800 Credits Retired</p>
                  <p className="text-sm text-gray-600">Climate offsetting initiative</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Retired</span>
                <p className="text-xs text-gray-500 mt-1">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectsView = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Your Projects</h3>
      <div className="text-center py-8">
        <span className="text-6xl mb-4 block">🏗️</span>
        <p className="text-gray-500">Projects view coming soon...</p>
      </div>
    </div>
  );

  const renderMarketplaceView = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Carbon Credit Marketplace</h3>
      <div className="text-center py-8">
        <span className="text-6xl mb-4 block">🏪</span>
        <p className="text-gray-500">Marketplace coming soon...</p>
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
      <div className="text-center py-8">
        <span className="text-6xl mb-4 block">📈</span>
        <p className="text-gray-500">Analytics coming soon...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        activeSection={activeSection}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        <main className="flex-1 lg:ml-64 p-6">
          {/* Section Indicator */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeSection === 'dashboard' ? 'Dashboard' : 
                 activeSection === 'register' ? 'Register Project' :
                 activeSection === 'mint' ? 'Mint Credits' :
                 activeSection === 'transfer' ? 'Transfer Credits' :
                 activeSection === 'retire' ? 'Retire Credits' :
                 activeSection === 'projects' ? 'My Projects' :
                 activeSection === 'marketplace' ? 'Marketplace' :
                 activeSection === 'analytics' ? 'Analytics' : activeSection}
              </h1>
              {connected && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Connected
                </span>
              )}
            </div>
            {activeSection !== 'dashboard' && (
              <button
                onClick={() => setActiveSection('dashboard')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}