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
    <div className="space-y-6">
      {/* Projects Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Your Blue Carbon Projects</h3>
          <button
            onClick={() => setActiveSection('register')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>New Project</span>
          </button>
        </div>
        
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-blue-800">Active Projects</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-green-800">Verified Projects</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">156.3K</div>
            <div className="text-sm text-orange-800">Total Credits Issued</div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {[
          {
            id: 'BCP-001',
            name: 'Mangrove Restoration Project',
            location: 'Pacific Coast, California',
            status: 'Verified',
            credits: '25,000',
            type: 'Mangrove Restoration',
            progress: 85
          },
          {
            id: 'BCP-002',
            name: 'Seagrass Meadow Conservation',
            location: 'Gulf of Mexico',
            status: 'Under Review',
            credits: '18,500',
            type: 'Seagrass Conservation',
            progress: 60
          },
          {
            id: 'BCP-003',
            name: 'Salt Marsh Restoration',
            location: 'Atlantic Coast, Florida',
            status: 'Active',
            credits: '31,200',
            type: 'Salt Marsh',
            progress: 92
          }
        ].map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Verified' ? 'bg-green-100 text-green-800' :
                    project.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">📍 {project.location}</p>
                <p className="text-sm text-gray-500 mb-4">Project ID: {project.id} • Type: {project.type}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Project Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="ml-6 text-right">
                <div className="text-2xl font-bold text-green-600">{project.credits}</div>
                <div className="text-sm text-gray-500">Credits Issued</div>
                <div className="mt-3 space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
                  <button className="text-green-600 hover:text-green-800 text-sm">Mint Credits</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMarketplaceView = () => (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Carbon Credit Marketplace</h3>
            <p className="text-gray-600">Buy and sell verified blue carbon credits</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Sell Credits
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Create Order
            </button>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">$24.50</div>
            <div className="text-sm text-blue-800">Average Price</div>
            <div className="text-xs text-green-600">+2.4% today</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">15,432</div>
            <div className="text-sm text-green-800">Credits Available</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">89</div>
            <div className="text-sm text-orange-800">Active Orders</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">$2.1M</div>
            <div className="text-sm text-purple-800">24h Volume</div>
          </div>
        </div>
      </div>

      {/* Market Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buy Orders */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-green-500 mr-2">📈</span>
            Buy Orders
          </h4>
          <div className="space-y-3">
            {[
              { price: '$24.80', amount: '1,250', total: '$31,000', project: 'Mangrove-CA' },
              { price: '$24.75', amount: '2,100', total: '$51,975', project: 'Seagrass-GM' },
              { price: '$24.70', amount: '850', total: '$20,995', project: 'Saltmarsh-FL' },
              { price: '$24.65', amount: '3,200', total: '$78,880', project: 'Mangrove-CA' },
            ].map((order, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex space-x-4">
                  <span className="font-medium text-green-700">{order.price}</span>
                  <span className="text-gray-600">{order.amount} credits</span>
                  <span className="text-sm text-gray-500">{order.project}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{order.total}</div>
                  <button className="text-xs text-green-600 hover:text-green-800">Buy</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sell Orders */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-red-500 mr-2">📉</span>
            Sell Orders
          </h4>
          <div className="space-y-3">
            {[
              { price: '$24.85', amount: '950', total: '$23,608', project: 'Kelp-OR' },
              { price: '$24.90', amount: '1,800', total: '$44,820', project: 'Mangrove-FL' },
              { price: '$24.95', amount: '1,200', total: '$29,940', project: 'Seagrass-TX' },
              { price: '$25.00', amount: '2,500', total: '$62,500', project: 'Saltmarsh-CA' },
            ].map((order, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex space-x-4">
                  <span className="font-medium text-red-700">{order.price}</span>
                  <span className="text-gray-600">{order.amount} credits</span>
                  <span className="text-sm text-gray-500">{order.project}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{order.total}</div>
                  <button className="text-xs text-red-600 hover:text-red-800">Sell</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Time</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Price</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Project</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '14:32', type: 'Buy', price: '$24.75', amount: '500', project: 'Mangrove-CA', total: '$12,375' },
                { time: '14:28', type: 'Sell', price: '$24.80', amount: '1,200', project: 'Seagrass-GM', total: '$29,760' },
                { time: '14:25', type: 'Buy', price: '$24.70', amount: '800', project: 'Saltmarsh-FL', total: '$19,760' },
                { time: '14:20', type: 'Buy', price: '$24.78', amount: '1,500', project: 'Kelp-OR', total: '$37,170' },
              ].map((tx, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-600">{tx.time}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tx.type === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-medium">{tx.price}</td>
                  <td className="py-3 text-sm">{tx.amount}</td>
                  <td className="py-3 text-sm text-gray-600">{tx.project}</td>
                  <td className="py-3 text-sm font-medium">{tx.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Analytics Dashboard</h3>
            <p className="text-gray-600">Comprehensive insights into blue carbon credit ecosystem</p>
          </div>
          <div className="flex space-x-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credits Issued</p>
              <p className="text-2xl font-bold text-gray-900">234.5K</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🪙</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Credits Retired</p>
              <p className="text-2xl font-bold text-gray-900">89.2K</p>
              <p className="text-sm text-green-600">+8.3% from last month</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Volume</p>
              <p className="text-2xl font-bold text-gray-900">$5.2M</p>
              <p className="text-sm text-red-600">-2.1% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">67</p>
              <p className="text-sm text-green-600">+5 new this month</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏗️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Issuance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Credit Issuance Trend</h4>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[45, 52, 38, 61, 48, 55, 67, 72, 59, 64, 78, 85].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(value / 85) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Types Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Types Distribution</h4>
          <div className="space-y-4">
            {[
              { type: 'Mangrove Restoration', percentage: 35, color: 'bg-green-500' },
              { type: 'Seagrass Conservation', percentage: 28, color: 'bg-blue-500' },
              { type: 'Salt Marsh Restoration', percentage: 22, color: 'bg-purple-500' },
              { type: 'Kelp Forest Protection', percentage: 15, color: 'bg-orange-500' },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.type}</span>
                    <span className="text-sm text-gray-500">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { region: 'Pacific Coast', projects: 23, credits: '89.2K', avgPrice: '$24.85', growth: '+15.2%' },
            { region: 'Gulf of Mexico', projects: 18, credits: '67.8K', avgPrice: '$24.92', growth: '+12.8%' },
            { region: 'Atlantic Coast', projects: 26, credits: '77.5K', avgPrice: '$24.78', growth: '+9.5%' },
          ].map((region, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">{region.region}</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Projects:</span>
                  <span className="text-sm font-medium">{region.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Credits:</span>
                  <span className="text-sm font-medium">{region.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Price:</span>
                  <span className="text-sm font-medium">{region.avgPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Growth:</span>
                  <span className="text-sm font-medium text-green-600">{region.growth}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">2,450</div>
            <div className="text-sm text-green-800">Hectares Protected</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">156K</div>
            <div className="text-sm text-blue-800">Tons CO₂ Sequestered</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">89</div>
            <div className="text-sm text-orange-800">Communities Supported</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">12.5M</div>
            <div className="text-sm text-purple-800">Marine Species Protected</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        activeSection={activeSection}
      />
      
      {/* Layout with static sidebar on desktop */}
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        {/* Main content area with proper spacing for static sidebar */}
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="p-6">
            {/* Section Indicator */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
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
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                    Connected
                  </span>
                )}
              </div>
              {activeSection !== 'dashboard' && (
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Dashboard</span>
                </button>
              )}
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}