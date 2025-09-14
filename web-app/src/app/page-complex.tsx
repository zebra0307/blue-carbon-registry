'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';
import CreditMintForm from '@/components/CreditMintForm';
import CreditTransferForm from '@/components/CreditTransferForm';
import CreditRetireForm from '@/components/CreditRetireForm';
import { Project, ProjectFormData, CreditMintData, CreditTransferData, CreditRetireData, TransactionResult } from '@/types';

type ModalType = 'register' | 'mint' | 'transfer' | 'retire' | null;

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    creditsIssued: 0,
    creditsTransferred: 12450,
    creditsRetired: 8320
  });

  useEffect(() => {
    // Mock data for now - replace with actual blockchain data
    const mockProjects: Project[] = [
      {
        projectId: 'BCP-001',
        owner: publicKey || new (require('@solana/web3.js')).PublicKey('11111111111111111111111111111111'),
        ipfsCid: 'QmExample1',
        creditsIssued: 12500,
        bump: 255,
      },
      {
        projectId: 'BCP-002', 
        owner: publicKey || new (require('@solana/web3.js')).PublicKey('11111111111111111111111111111111'),
        ipfsCid: 'QmExample2',
        creditsIssued: 8750,
        bump: 254,
      },
      {
        projectId: 'BCP-003',
        owner: publicKey || new (require('@solana/web3.js')).PublicKey('11111111111111111111111111111111'),
        ipfsCid: 'QmExample3',
        creditsIssued: 15200,
        bump: 253,
      },
    ];
    
    setProjects(mockProjects);
    
    // Update stats
    const totalCredits = mockProjects.reduce((total, project) => total + project.creditsIssued, 0);
    setStats(prev => ({
      ...prev,
      totalProjects: mockProjects.length,
      creditsIssued: totalCredits
    }));
    
    setLoading(false);
  }, [publicKey]);

  const handleProjectSubmit = async (data: ProjectFormData): Promise<TransactionResult> => {
    try {
      // TODO: Implement actual blockchain transaction
      console.log('Registering project:', data);
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setActiveModal(null);
      return { success: true, signature: 'mock-signature' };
    } catch (error) {
      return { success: false, error: 'Failed to register project', signature: '' };
    }
  };

  const handleCreditMint = async (data: CreditMintData): Promise<TransactionResult> => {
    try {
      // TODO: Implement actual blockchain transaction
      console.log('Minting credits:', data);
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setActiveModal(null);
      return { success: true, signature: 'mock-signature' };
    } catch (error) {
      return { success: false, error: 'Failed to mint credits', signature: '' };
    }
  };

  const handleCreditTransfer = async (data: CreditTransferData): Promise<TransactionResult> => {
    try {
      // TODO: Implement actual blockchain transaction
      console.log('Transferring credits:', data);
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setActiveModal(null);
      return { success: true, signature: 'mock-signature' };
    } catch (error) {
      return { success: false, error: 'Failed to transfer credits', signature: '' };
    }
  };

  const handleCreditRetire = async (data: CreditRetireData): Promise<TransactionResult> => {
    try {
      // TODO: Implement actual blockchain transaction
      console.log('Retiring credits:', data);
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setActiveModal(null);
      return { success: true, signature: 'mock-signature' };
    } catch (error) {
      return { success: false, error: 'Failed to retire credits', signature: '' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-ocean-blue-600 to-carbon-green-600 rounded-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-4">Blue Carbon Registry</h1>
          <p className="text-xl opacity-90 mb-6">
            Manage carbon credits from blue carbon ecosystems on the Solana blockchain
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <div className="text-sm opacity-80">Active Projects</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.creditsIssued.toLocaleString()}</div>
              <div className="text-sm opacity-80">Tonnes CO2 Offset</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">$2.1M</div>
              <div className="text-sm opacity-80">Market Value</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-ocean-blue-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-ocean-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Projects
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stats.totalProjects}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-carbon-green-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-carbon-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Credits Issued
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stats.creditsIssued.toLocaleString()}
                    </dd>
                    <dd className="text-xs text-gray-500">tonnes CO2</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-yellow-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Transferred
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stats.creditsTransferred.toLocaleString()}
                    </dd>
                    <dd className="text-xs text-gray-500">tonnes CO2</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-red-500">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Retired
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stats.creditsRetired.toLocaleString()}
                    </dd>
                    <dd className="text-xs text-gray-500">tonnes CO2</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setActiveModal('register')}
              className="bg-gradient-to-r from-ocean-blue-600 to-ocean-blue-700 text-white py-4 px-6 rounded-lg hover:from-ocean-blue-700 hover:to-ocean-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Register Project
              </div>
            </button>
            <button 
              onClick={() => setActiveModal('mint')}
              className="bg-gradient-to-r from-carbon-green-600 to-carbon-green-700 text-white py-4 px-6 rounded-lg hover:from-carbon-green-700 hover:to-carbon-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mint Credits
              </div>
            </button>
            <button 
              onClick={() => setActiveModal('transfer')}
              className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-4 px-6 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transfer Credits
              </div>
            </button>
            <button 
              onClick={() => setActiveModal('retire')}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Retire Credits
              </div>
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Projects
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {connected ? 'Projects registered to your wallet' : 'Connect your wallet to view projects'}
            </p>
          </div>
          
          {loading ? (
            <div className="px-6 py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.projectId} 
                  project={project} 
                  onViewDetails={(project) => {
                    console.log('View details for project:', project.projectId);
                    // Add navigation logic here if needed
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by registering your first project.</p>
              <div className="mt-6">
                <button
                  onClick={() => setActiveModal('register')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-ocean-blue-600 hover:bg-ocean-blue-700"
                >
                  Register Project
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {activeModal === 'register' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <ProjectForm 
              onSubmit={handleProjectSubmit}
              onCancel={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {activeModal === 'mint' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <CreditMintForm 
              projectId={projects[0]?.projectId || ''}
              onSubmit={handleCreditMint}
              onCancel={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {activeModal === 'transfer' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <CreditTransferForm 
              onSubmit={handleCreditTransfer}
              onCancel={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {activeModal === 'retire' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <CreditRetireForm 
              onSubmit={handleCreditRetire}
              onCancel={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
