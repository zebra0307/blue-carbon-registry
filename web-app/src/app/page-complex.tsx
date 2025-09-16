'use client';

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  TreePine, 
  Users, 
  Building2, 
  TrendingUp, 
  Settings, 
  ChevronRight,
  BarChart3,
  Coins,
  ArrowUpDown,
  Trash2,
  ShoppingCart,
  Lock,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import ProjectForm from '../components/ProjectForm';
import CreditMintForm from '../components/CreditMintForm';
import CreditTransferForm from '../components/CreditTransferForm';
import CreditRetireForm from '../components/CreditRetireForm';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import MarketplaceComponent from '../components/MarketplaceComponent';
import VerificationSystem from '../components/VerificationSystem';
import { VerificationData, VerificationStatus } from '@/types';

interface Project {
  projectId: string;
  name: string;
  location: string;
  area: number;
  carbonStored: number;
  creditsIssued: number;
  owner: any;
  bump: number;
  ipfsCid: string;
  verification: VerificationData;
  canMintCredits: boolean;
}

type ModalType = 'register' | 'mint' | 'transfer' | 'retire' | null;
type SidebarSection = 'dashboard' | 'projects' | 'register' | 'mint' | 'transfer' | 'retire' | 'marketplace' | 'analytics';

export default function Dashboard() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeSection, setActiveSection] = useState<SidebarSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 3,
    creditsIssued: 36450,
    creditsTransferred: 12450,
    creditsRetired: 8320
  });

  useEffect(() => {
    // Mock data for demo
    const mockProjects: Project[] = [
      {
        projectId: 'BCP-001',
        name: 'Coastal Mangrove Restoration',
        location: 'Queensland, Australia',
        area: 150.5,
        carbonStored: 2400.8,
        creditsIssued: 12500,
        owner: publicKey || new (require('@solana/web3.js')).PublicKey('11111111111111111111111111111111'),
        bump: 255,
        ipfsCid: 'QmExample1',
        verification: {
          status: 'approved',
          submittedAt: new Date('2024-01-15'),
          reviewedAt: new Date('2024-02-01'),
          verifiedBy: 'Carbon Verification International',
          verificationNotes: 'Project meets all verification standards. Field verification completed successfully.',
          requiredDocuments: ['Project Proposal', 'Land Rights', 'Baseline Data', 'Environmental Assessment'],
          submittedDocuments: ['Project Proposal', 'Land Rights', 'Baseline Data', 'Environmental Assessment'],
          fieldVerificationDate: new Date('2024-01-25'),
          scientificReviewDate: new Date('2024-01-30')
        },
        canMintCredits: true
      },
      {
        projectId: 'BCP-002',
        name: 'Seagrass Meadow Protection',
        location: 'Florida Keys, USA',
        area: 89.3,
        carbonStored: 1850.2,
        creditsIssued: 9800,
        owner: publicKey || new (require('@solana/web3.js')).PublicKey('11111111111111111111111111111111'),
        bump: 254,
        ipfsCid: 'QmExample2',
        verification: {
          status: 'field_verification',
          submittedAt: new Date('2024-02-10'),
          reviewedAt: new Date('2024-02-15'),
          verifiedBy: 'Marine Conservation Verifiers',
          verificationNotes: 'Initial documentation approved. Field verification scheduled for next week.',
          requiredDocuments: ['Project Proposal', 'Land Rights', 'Baseline Data', 'Environmental Assessment', 'Marine Survey'],
          submittedDocuments: ['Project Proposal', 'Land Rights', 'Baseline Data', 'Environmental Assessment'],
          fieldVerificationDate: new Date('2024-02-20')
        },
        canMintCredits: false
      }
    ];
    setProjects(mockProjects);
    setLoading(false);
  }, [publicKey]);

  // Handle wallet connection state changes
  useEffect(() => {
    const walletGatedSections = ['register', 'mint', 'transfer', 'retire'];
    
    // If wallet disconnects and user is on a wallet-gated section, redirect to dashboard
    if (!connected && walletGatedSections.includes(activeSection)) {
      setActiveSection('dashboard');
    }
  }, [connected, activeSection]);

  // Navigation items in the correct order as shown in image
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-600', borderColor: 'border-blue-200', requiresWallet: false },
    { id: 'projects', label: 'My Projects', icon: Building2, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700', iconColor: 'text-purple-600', borderColor: 'border-purple-200', requiresWallet: false },
    { id: 'register', label: 'Register Project', icon: TreePine, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-600', borderColor: 'border-green-200', requiresWallet: true },
    { id: 'mint', label: 'Mint Credits', icon: Coins, color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', iconColor: 'text-orange-600', borderColor: 'border-orange-200', requiresWallet: true },
    { id: 'transfer', label: 'Transfer Credits', icon: ArrowUpDown, color: 'indigo', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', iconColor: 'text-indigo-600', borderColor: 'border-indigo-200', requiresWallet: true },
    { id: 'retire', label: 'Retire Credits', icon: Trash2, color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', iconColor: 'text-red-600', borderColor: 'border-red-200', requiresWallet: true },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, color: 'pink', bgColor: 'bg-pink-50', textColor: 'text-pink-700', iconColor: 'text-pink-600', borderColor: 'border-pink-200', requiresWallet: false },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200', requiresWallet: false }
  ];

  // Helper component for wallet-gated content
  const WalletGatedContent = ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => {
    if (!connected) {
      // Determine colors based on the title/section
      let headerBg = 'bg-gradient-to-r from-gray-50 to-gray-25';
      let titleColor = 'text-gray-700';
      let descColor = 'text-gray-600';
      
      if (title.includes('Register')) {
        headerBg = 'bg-gradient-to-r from-green-50 to-green-25';
        titleColor = 'text-green-700';
        descColor = 'text-green-600';
      } else if (title.includes('Mint')) {
        headerBg = 'bg-gradient-to-r from-orange-50 to-orange-25';
        titleColor = 'text-orange-700';
        descColor = 'text-orange-600';
      } else if (title.includes('Transfer')) {
        headerBg = 'bg-gradient-to-r from-indigo-50 to-indigo-25';
        titleColor = 'text-indigo-700';
        descColor = 'text-indigo-600';
      } else if (title.includes('Retire')) {
        headerBg = 'bg-gradient-to-r from-red-50 to-red-25';
        titleColor = 'text-red-700';
        descColor = 'text-red-600';
      }
      
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className={`p-6 border-b border-gray-200 ${headerBg}`}>
            <h3 className={`text-2xl font-black tracking-tight ${titleColor}`}>{title}</h3>
            <p className={`text-sm font-semibold mt-2 tracking-wide ${descColor}`}>{description}</p>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Wallet Connection Required</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto font-medium">
                Connect your Solana wallet to access this feature and start managing your blue carbon projects and credits.
              </p>
              <WalletMultiButton />
            </div>
          </div>
        </div>
      );
    }
    return children;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome to Blue Carbon MRV</h2>
              <p className="text-blue-100 mb-4">Manage carbon credits from blue carbon ecosystems on the Solana blockchain.</p>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  {connected 
                    ? `Connected: ${publicKey?.toString().slice(0, 8)}...` 
                    : 'Wallet not connected'
                  }
                </span>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">15</p>
                  </div>
                  <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Credits Issued</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">125.4K</p>
                  </div>
                  <div className="p-2 lg:p-3 bg-orange-100 rounded-lg">
                    <Coins className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transferred</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">42.8K</p>
                  </div>
                  <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
                    <ArrowUpDown className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Retired</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">28.6K</p>
                  </div>
                  <div className="p-2 lg:p-3 bg-red-100 rounded-lg">
                    <Trash2 className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveSection('register')}
                    className="p-6 border-2 border-dashed border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group"
                  >
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <TreePine className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="mt-4 font-medium text-gray-900">Register Project</h4>
                      <p className="mt-1 text-sm text-green-600">Add new carbon project</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('mint')}
                    className="p-6 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                  >
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <Coins className="h-6 w-6 text-orange-600" />
                      </div>
                      <h4 className="mt-4 font-medium text-gray-900">Mint Credits</h4>
                      <p className="mt-1 text-sm text-blue-600">Issue new carbon credits</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('transfer')}
                    className="p-6 border-2 border-dashed border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
                  >
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <ArrowUpDown className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="mt-4 font-medium text-gray-900">Transfer Credits</h4>
                      <p className="mt-1 text-sm text-yellow-600">Send credits to others</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('retire')}
                    className="p-6 border-2 border-dashed border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all group"
                  >
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <Trash2 className="h-6 w-6 text-red-600" />
                      </div>
                      <h4 className="mt-4 font-medium text-gray-900">Retire Credits</h4>
                      <p className="mt-1 text-sm text-red-600">Permanently retire credits</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Coins className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Minted 2,500 credits</p>
                        <p className="text-xs text-gray-500">Coastal Mangrove Project • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ArrowUpDown className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Transferred 1,000 credits</p>
                        <p className="text-xs text-gray-500">To marketplace • 5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <TreePine className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Registered new project</p>
                        <p className="text-xs text-gray-500">Seagrass Conservation • 1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Retired 500 credits</p>
                        <p className="text-xs text-gray-500">Offset company emissions • 2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Overview */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Portfolio Overview</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total Portfolio Value</span>
                      <span className="text-lg font-bold text-gray-900">$1,782,450</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Available Credits</span>
                        <span className="text-sm font-medium">54,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Price</span>
                        <span className="text-sm font-medium">$14.25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Growth</span>
                        <span className="text-sm font-medium text-green-600">+12.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total CO₂ Impact</span>
                        <span className="text-sm font-medium">125,400 tons</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Projects */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Active Projects</h3>
                  <p className="text-sm text-gray-600 mt-1">Your registered blue carbon projects</p>
                </div>
                <button 
                  onClick={() => setActiveSection('projects')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading projects...</p>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="grid gap-4">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.projectId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <TreePine className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <p className="text-sm text-gray-600">{project.location} • {project.area} hectares</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{project.creditsIssued.toLocaleString()} credits</p>
                          <p className="text-sm text-gray-600">{project.carbonStored} tons CO₂</p>
                        </div>
                      </div>
                    ))}
                    {projects.length > 3 && (
                      <div className="text-center pt-4">
                        <button 
                          onClick={() => setActiveSection('projects')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View {projects.length - 3} more projects →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No projects registered yet</p>
                    <button 
                      onClick={() => setActiveSection('register')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Register Your First Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'register':
        return (
          <WalletGatedContent 
            title="Register New Project" 
            description="Register a new blue carbon project on the blockchain"
          >
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-25">
                <h3 className="text-2xl font-black text-green-700 tracking-tight">Register New Project</h3>
                <p className="text-sm font-semibold text-green-600 mt-2 tracking-wide">Register a new blue carbon project on the blockchain</p>
              </div>
              <div className="p-6">
                <ProjectForm 
                  onSubmit={async (data) => {
                    try {
                      // Import necessary modules
                      const { Program, AnchorProvider, web3 } = await import('@coral-xyz/anchor');
                      
                      if (!publicKey || !connected) {
                        throw new Error('Wallet not connected');
                      }

                      // Create a project with proper verification system
                      const newProject: Project = {
                        projectId: data.projectId,
                        name: data.name,
                        location: data.location,
                        area: Math.floor(Math.random() * 1000) + 100, // Mock area
                        carbonStored: Math.floor(Math.random() * 10000) + 1000, // Mock carbon stored
                        creditsIssued: 0, // New project starts with 0 credits
                        owner: publicKey,
                        bump: 0,
                        ipfsCid: `QmExample${Date.now()}`, // Mock IPFS CID
                        verification: {
                          status: 'pending',
                          submittedAt: new Date(),
                          requiredDocuments: [
                            'Project Proposal',
                            'Land Rights Documentation',
                            'Baseline Carbon Measurements',
                            'Environmental Impact Assessment',
                            'Restoration Plan',
                            'Monitoring Protocol',
                            'GPS Coordinates Verification',
                            'Photographic Evidence'
                          ],
                          submittedDocuments: [
                            'Project Proposal', // Assume basic form submission provides this
                            'GPS Coordinates Verification' // Location provided
                          ],
                          verificationNotes: 'Initial project submission received. Awaiting document review.'
                        },
                        canMintCredits: false // Cannot mint until verified
                      };

                      // Add to local projects list
                      setProjects(prev => [...prev, newProject]);
                      
                      // Update stats
                      setStats(prev => ({
                        ...prev,
                        totalProjects: prev.totalProjects + 1
                      }));

                      // Show success message with verification info
                      alert(`Project "${data.name}" registered successfully!\n\nNext Steps:\n1. Your project is now under review\n2. Please submit required documents\n3. Verification process typically takes 7-14 days\n4. You'll be notified when verification is complete\n\nNote: Credit minting is disabled until project verification is complete.`);
                      
                      // Navigate back to projects view
                      setActiveSection('projects');
                      
                      return { success: true };
                    } catch (error) {
                      console.error('Error registering project:', error);
                      return { 
                        success: false, 
                        error: error instanceof Error ? error.message : 'Failed to register project'
                      };
                    }
                  }}
                  onCancel={() => setActiveSection('dashboard')}
                />
              </div>
            </div>
          </WalletGatedContent>
        );

      case 'mint':
        return (
          <WalletGatedContent 
            title="Mint Carbon Credits" 
            description="Issue new carbon credits for verified sequestration"
          >
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-25">
                <h3 className="text-2xl font-black text-orange-700 tracking-tight">Mint Carbon Credits</h3>
                <p className="text-sm font-semibold text-orange-600 mt-2 tracking-wide">Issue new carbon credits for verified sequestration</p>
              </div>
              <div className="p-6">
                {/* Verification Status Check */}
                {projects.length > 0 && projects.some(p => p.verification.status === 'approved') ? (
                  <CreditMintForm 
                    projectId="BCP-001"
                    onSubmit={async (data) => {
                      console.log('Mint data:', data);
                      return { success: true };
                    }}
                    onCancel={() => setActiveSection('dashboard')}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Verified Projects Available</h4>
                      <p className="text-gray-600 mb-4">
                        You need at least one verified project before you can mint carbon credits.
                      </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-yellow-800 mb-2">Verification Requirements:</h5>
                      <ul className="text-sm text-yellow-700 text-left list-disc list-inside space-y-1">
                        <li>Submit all required documentation</li>
                        <li>Pass field verification by certified assessors</li>
                        <li>Complete scientific review of carbon data</li>
                        <li>Obtain final approval from verification team</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => setActiveSection('register')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-4"
                    >
                      Register New Project
                    </button>
                    <button
                      onClick={() => setActiveSection('projects')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      View My Projects
                    </button>
                  </div>
                )}
              </div>
            </div>
          </WalletGatedContent>
        );

      case 'transfer':
        return (
          <WalletGatedContent 
            title="Transfer Credits" 
            description="Transfer carbon credits to another wallet"
          >
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-25">
                <h3 className="text-2xl font-black text-indigo-700 tracking-tight">Transfer Credits</h3>
                <p className="text-sm font-semibold text-indigo-600 mt-2 tracking-wide">Transfer carbon credits to another wallet</p>
              </div>
              <div className="p-6">
                <CreditTransferForm 
                  onSubmit={async (data) => {
                    console.log('Transfer data:', data);
                    return { success: true };
                  }}
                  onCancel={() => setActiveSection('dashboard')}
                />
              </div>
            </div>
          </WalletGatedContent>
        );

      case 'retire':
        return (
          <WalletGatedContent 
            title="Retire Credits" 
            description="Permanently retire carbon credits to offset emissions"
          >
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-25">
                <h3 className="text-2xl font-black text-red-700 tracking-tight">Retire Credits</h3>
                <p className="text-sm font-semibold text-red-600 mt-2 tracking-wide">Permanently retire carbon credits to offset emissions</p>
              </div>
              <div className="p-6">
                <CreditRetireForm 
                  onSubmit={async (data) => {
                    console.log('Retire data:', data);
                    return { success: true };
                  }}
                  onCancel={() => setActiveSection('dashboard')}
                />
              </div>
            </div>
          </WalletGatedContent>
        );

      case 'projects':
        return (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-25">
              <h3 className="text-2xl font-black text-purple-700 tracking-tight">My Projects</h3>
              <p className="text-sm font-semibold text-purple-600 mt-2 tracking-wide">Manage your registered blue carbon projects</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading projects...</p>
                </div>
              ) : projects.length > 0 ? (
                <div className="grid gap-6">
                  {projects.map((project) => (
                    <div key={project.projectId} className="border rounded-lg overflow-hidden">
                      {/* Project Header */}
                      <div className="p-6 border-b">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                              <TreePine className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
                              <p className="text-gray-600">{project.location}</p>
                              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Area:</span>
                                  <span className="ml-2 font-medium">{project.area} hectares</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Carbon Stored:</span>
                                  <span className="ml-2 font-medium">{project.carbonStored} tons CO₂</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Credits Issued:</span>
                                  <span className="ml-2 font-medium">{project.creditsIssued.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Project ID:</span>
                                  <span className="ml-2 font-medium">{project.projectId}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => setActiveSection('mint')}
                              disabled={!project.canMintCredits}
                              className={`px-3 py-2 text-sm rounded-lg ${
                                project.canMintCredits 
                                  ? 'bg-green-600 text-white hover:bg-green-700' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              title={!project.canMintCredits ? 'Project must be verified before minting credits' : 'Mint carbon credits'}
                            >
                              {project.canMintCredits ? 'Mint Credits' : 'Verification Required'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Verification System Component */}
                      <div className="p-6 bg-gray-50">
                        <VerificationSystem 
                          projectId={project.projectId}
                          verification={project.verification}
                          onStatusUpdate={(newStatus: VerificationStatus) => {
                            setProjects(prev => prev.map(p => 
                              p.projectId === project.projectId 
                                ? { 
                                    ...p, 
                                    verification: { ...p.verification, status: newStatus },
                                    canMintCredits: newStatus === 'approved'
                                  }
                                : p
                            ));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No projects registered yet</p>
                  <button 
                    onClick={() => setActiveSection('register')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Register Your First Project
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return <AnalyticsDashboard />;



      case 'marketplace':
        return <MarketplaceComponent />;


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-4 lg:px-8 py-3 lg:py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center space-x-5">
            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src="/bluecarbon3.png" 
                  alt="Blue Carbon MRV" 
                  className="h-12 w-12 rounded-xl shadow-md ring-2 ring-blue-100"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Blue Carbon MRV</h1>
                <p className="text-sm font-semibold text-blue-600 tracking-wide">Sustainable Carbon Credits</p>
              </div>
            </div>
          </div>
          
          {/* Status and Connection Info */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Network Status - Hidden on small screens */}
            <div className="hidden md:flex items-center space-x-3 px-4 py-2.5 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="relative">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="absolute inset-0 w-3 h-3 bg-orange-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-sm font-bold text-orange-800 tracking-wide">Devnet</span>
            </div>
            
            {/* Connection Status - Simplified on mobile */}
            <div className={`flex items-center space-x-2 md:space-x-3 px-2 md:px-4 py-2.5 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
              connected 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
                : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800'
            }`}>
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {connected && (
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-pulse opacity-75"></div>
                )}
              </div>
              <span className="text-xs md:text-sm font-bold tracking-wide">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Wallet Button */}
            <div className="wallet-button-container">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-50/95 to-white/95 backdrop-blur-xl shadow-xl transform transition-transform" onClick={(e) => e.stopPropagation()}>
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/60 bg-white/50">
              <div className="flex items-center space-x-3">
                <img 
                  src="/bluecarbon3.png" 
                  alt="Blue Carbon MRV" 
                  className="h-8 w-8 rounded-lg shadow-sm ring-1 ring-blue-100"
                />
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">Navigation</h2>
                  <p className="text-xs font-semibold text-blue-600 tracking-wide">Blue Carbon MRV</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Mobile Navigation Items */}
            <nav className="p-4 space-y-2 pt-6 overflow-y-auto h-full pb-20">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isWalletGated = item.requiresWallet;
                const isLocked = isWalletGated && !connected;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isLocked) {
                        return;
                      }
                      setActiveSection(item.id as SidebarSection);
                      setMobileMenuOpen(false); // Close mobile menu after selection
                    }}
                    className={`group relative w-full flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isLocked
                        ? 'text-gray-400 bg-gray-50/50 border-2 border-gray-200/30 cursor-not-allowed'
                        : isActive
                        ? `${item.bgColor} ${item.textColor} border-2 ${item.borderColor} shadow-lg backdrop-blur-sm`
                        : 'text-gray-700 hover:text-gray-900 hover:bg-white/80 hover:shadow-md border-2 border-transparent hover:border-gray-200/50 backdrop-blur-sm'
                    }`}
                  >
                    <div className={`relative p-2 rounded-xl mr-3 transition-all duration-300 ${
                      isLocked
                        ? 'bg-gray-100/50'
                        : isActive 
                        ? `bg-white shadow-lg border border-white/50`
                        : 'bg-gray-100/80 group-hover:bg-white/90 group-hover:shadow-sm'
                    }`}>
                      <Icon className={`h-5 w-5 transition-all duration-300 ${
                        isLocked
                          ? 'text-gray-400'
                          : isActive 
                          ? item.iconColor
                          : 'text-gray-500 group-hover:text-gray-700'
                      }`} />
                      {isActive && !isLocked && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent"></div>
                      )}
                    </div>
                    <span className="flex-1 text-left font-black tracking-wide">{item.label}</span>
                    
                    {/* Show lock icon for wallet-gated items when not connected */}
                    {isLocked && (
                      <div className="p-1 rounded-xl bg-gray-200/50">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Show chevron for active non-locked items */}
                    {isActive && !isLocked && (
                      <div className={`p-1 rounded-xl ${item.bgColor} shadow-md`}>
                        <ChevronRight className={`h-4 w-4 ${item.iconColor}`} />
                      </div>
                    )}
                    
                    {/* Modern glass effect overlay - disabled for locked items */}
                    {!isLocked && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </button>
                );
              })}
              
              {/* Mobile menu footer */}
              <div className="mt-6 pt-4 border-t border-gray-200/60 bg-white/30 backdrop-blur-sm rounded-xl">
                <div className="text-center p-3">
                  <p className="text-xs font-black text-gray-600 tracking-wide">POWERED BY SOLANA</p>
                  <p className="text-xs font-bold text-gray-500 mt-1 tracking-wider">v1.0.0</p>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      <div className="flex pt-20">
        {/* Fixed Sidebar - Hidden on mobile */}
        <div className="hidden lg:block fixed left-0 top-20 bottom-0 w-64 bg-gradient-to-b from-gray-50/80 to-white/90 backdrop-blur-sm border-r border-gray-200/60 shadow-xl overflow-y-auto">
          <nav className="p-4 space-y-2 pt-6">{sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const isWalletGated = item.requiresWallet;
              const isLocked = isWalletGated && !connected;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isLocked) {
                      // Don't allow navigation to wallet-gated sections when not connected
                      return;
                    }
                    setActiveSection(item.id as SidebarSection);
                  }}
                  className={`group relative w-full flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    isLocked
                      ? 'text-gray-400 bg-gray-50/50 border-2 border-gray-200/30 cursor-not-allowed'
                      : isActive
                      ? `${item.bgColor} ${item.textColor} border-2 ${item.borderColor} shadow-lg backdrop-blur-sm`
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/80 hover:shadow-md border-2 border-transparent hover:border-gray-200/50 backdrop-blur-sm'
                  }`}
                >
                  <div className={`relative p-2 rounded-xl mr-3 transition-all duration-300 ${
                    isLocked
                      ? 'bg-gray-100/50'
                      : isActive 
                      ? `bg-white shadow-lg border border-white/50`
                      : 'bg-gray-100/80 group-hover:bg-white/90 group-hover:shadow-sm'
                  }`}>
                    <Icon className={`h-5 w-5 transition-all duration-300 ${
                      isLocked
                        ? 'text-gray-400'
                        : isActive 
                        ? item.iconColor
                        : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    {isActive && !isLocked && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent"></div>
                    )}
                  </div>
                  <span className="flex-1 text-left font-black tracking-wide">{item.label}</span>
                  
                  {/* Show lock icon for wallet-gated items when not connected */}
                  {isLocked && (
                    <div className="p-1 rounded-xl bg-gray-200/50">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Show chevron for active non-locked items */}
                  {isActive && !isLocked && (
                    <div className={`p-1 rounded-xl ${item.bgColor} shadow-md`}>
                      <ChevronRight className={`h-4 w-4 ${item.iconColor}`} />
                    </div>
                  )}
                  
                  {/* Modern glass effect overlay - disabled for locked items */}
                  {!isLocked && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </button>
              );
            })}
          </nav>
          
          {/* Sidebar Footer - positioned after navigation */}
          <div className="mt-4 mx-4 mb-4 pt-4 border-t border-gray-200/60 bg-white/30 backdrop-blur-sm rounded-xl">
            <div className="text-center p-3">
              <p className="text-xs font-black text-gray-600 tracking-wide">POWERED BY SOLANA</p>
              <p className="text-xs font-bold text-gray-500 mt-1 tracking-wider">v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Main Content Area - Responsive margins */}
        <div className="flex-1 lg:ml-64 p-4 lg:p-6 max-w-full overflow-hidden">
          {!connected ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <img 
                  src="/bluecarbon3.png" 
                  alt="Blue Carbon MRV" 
                  className="h-24 w-24 mx-auto mb-4 rounded-full shadow-lg"
                />
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Welcome to Blue Carbon MRV</h2>
                <p className="text-sm lg:text-base text-gray-600 mb-6">
                  Connect your wallet to start managing blue carbon projects and carbon credits on the Solana blockchain.
                </p>
                <WalletMultiButton />
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}