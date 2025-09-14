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
  ShoppingCart
} from 'lucide-react';
import ProjectForm from '../components/ProjectForm';
import CreditMintForm from '../components/CreditMintForm';
import CreditTransferForm from '../components/CreditTransferForm';
import CreditRetireForm from '../components/CreditRetireForm';

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
        ipfsCid: 'QmExample1'
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
        ipfsCid: 'QmExample2'
      }
    ];
    setProjects(mockProjects);
    setLoading(false);
  }, [publicKey]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', iconColor: 'text-blue-600', borderColor: 'border-blue-200' },
    { id: 'register', label: 'Register Project', icon: TreePine, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', iconColor: 'text-green-600', borderColor: 'border-green-200' },
    { id: 'mint', label: 'Mint Credits', icon: Coins, color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', iconColor: 'text-orange-600', borderColor: 'border-orange-200' },
    { id: 'transfer', label: 'Transfer Credits', icon: ArrowUpDown, color: 'indigo', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', iconColor: 'text-indigo-600', borderColor: 'border-indigo-200' },
    { id: 'retire', label: 'Retire Credits', icon: Trash2, color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', iconColor: 'text-red-600', borderColor: 'border-red-200' },
    { id: 'projects', label: 'My Projects', icon: Building2, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700', iconColor: 'text-purple-600', borderColor: 'border-purple-200' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, color: 'pink', bgColor: 'bg-pink-50', textColor: 'text-pink-700', iconColor: 'text-pink-600', borderColor: 'border-pink-200' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome to Blue Carbon Registry</h2>
              <p className="text-blue-100 mb-4">Manage carbon credits from blue carbon ecosystems on the Solana blockchain.</p>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm">Connected: {publicKey?.toString().slice(0, 8)}...</span>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">15</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Credits Issued</p>
                    <p className="text-2xl font-bold text-gray-900">125.4K</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Coins className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transferred</p>
                    <p className="text-2xl font-bold text-gray-900">42.8K</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ArrowUpDown className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Retired</p>
                    <p className="text-2xl font-bold text-gray-900">28.6K</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Trash2 className="h-6 w-6 text-red-600" />
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
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Register New Project</h3>
              <p className="text-sm text-gray-600 mt-1">Register a new blue carbon project on the blockchain</p>
            </div>
            <div className="p-6">
              <ProjectForm 
                onSubmit={async (data) => {
                  // Handle project registration
                  console.log('Project data:', data);
                  return { success: true };
                }}
                onCancel={() => setActiveSection('dashboard')}
              />
            </div>
          </div>
        );

      case 'mint':
        return (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Mint Carbon Credits</h3>
              <p className="text-sm text-gray-600 mt-1">Issue new carbon credits for verified sequestration</p>
            </div>
            <div className="p-6">
              <CreditMintForm 
                projectId="BCP-001"
                onSubmit={async (data) => {
                  console.log('Mint data:', data);
                  return { success: true };
                }}
                onCancel={() => setActiveSection('dashboard')}
              />
            </div>
          </div>
        );

      case 'transfer':
        return (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Transfer Credits</h3>
              <p className="text-sm text-gray-600 mt-1">Transfer carbon credits to another wallet</p>
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
        );

      case 'retire':
        return (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Retire Credits</h3>
              <p className="text-sm text-gray-600 mt-1">Permanently retire carbon credits to offset emissions</p>
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
        );

      case 'projects':
        return (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">My Projects</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your registered blue carbon projects</p>
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
                    <div key={project.projectId} className="border rounded-lg p-6">
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
                            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Mint Credits
                          </button>
                        </div>
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
        return (
          <div className="space-y-6">
            {/* Header with controls */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <p className="text-gray-600 mt-1">Comprehensive insights into blue carbon credit ecosystem</p>
              </div>
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Export Report
                </button>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Credits Issued</p>
                    <p className="text-2xl font-bold text-gray-900">234.5K</p>
                    <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Coins className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Credits Retired</p>
                    <p className="text-2xl font-bold text-gray-900">89.2K</p>
                    <p className="text-sm text-green-600 mt-1">+8.3% from last month</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Volume</p>
                    <p className="text-2xl font-bold text-gray-900">$5.2M</p>
                    <p className="text-sm text-red-600 mt-1">-2.1% from last month</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">67</p>
                    <p className="text-sm text-blue-600 mt-1">+5 new this month</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Credit Issuance Trend Chart */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Credit Issuance Trend</h3>
                </div>
                <div className="p-6">
                  <div className="relative">
                    <div className="h-48 bg-gray-50 rounded-lg p-4 overflow-hidden">
                      <div className="h-full flex items-end justify-between space-x-1">
                        {[35, 42, 28, 55, 48, 65, 72, 58, 85, 95, 82, 78].map((height, index) => {
                          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          const barHeight = Math.max((height / 100) * 100, 8); // Scale to container height
                          return (
                            <div key={index} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                              <div 
                                className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors cursor-pointer"
                                style={{ 
                                  height: `${barHeight}%`,
                                  maxWidth: '32px',
                                  minHeight: '8px'
                                }}
                                title={`${monthNames[index]}: ${Math.round(height * 2.5)}K credits`}
                              ></div>
                              {/* Tooltip on hover */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                {Math.round(height * 2.5)}K
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-12 gap-1 text-xs text-gray-500 text-center">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                      <span>Nov</span>
                      <span>Dec</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Types Distribution */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Project Types Distribution</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Mangrove Restoration</span>
                        <span className="font-medium">35%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Seagrass Conservation</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Salt Marsh Restoration</span>
                        <span className="font-medium">22%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Kelp Forest Protection</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Regional Distribution */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Regional Distribution</h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">North America</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Asia Pacific</span>
                    <span className="font-medium">31%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Europe</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Other</span>
                    <span className="font-medium">9%</span>
                  </div>
                </div>
              </div>

              {/* Carbon Impact */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Carbon Impact</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">1.2M</div>
                    <div className="text-sm text-gray-600">tons CO₂ sequestered</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-medium">Annual Rate</div>
                      <div className="text-green-600">+15.3%</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-medium">Efficiency</div>
                      <div className="text-blue-600">94.2%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Trends */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Market Trends</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Avg Price</span>
                    <span className="font-medium text-green-600">$14.25 ↑</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Volume</span>
                    <span className="font-medium text-blue-600">89.2K ↑</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Liquidity</span>
                    <span className="font-medium text-orange-600">High</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Volatility</span>
                    <span className="font-medium text-red-600">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'marketplace':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Carbon Credit Marketplace</h3>
                <p className="text-sm text-gray-600 mt-1">Buy and sell verified carbon credits</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Available Credits for Sale */}
                  <div className="col-span-full">
                    <h4 className="font-medium text-gray-900 mb-4">Available Credits</h4>
                    <div className="grid gap-4">
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <TreePine className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">Coastal Mangrove Credits</h5>
                              <p className="text-sm text-gray-600">Queensland, Australia • 1,500 credits available</p>
                              <div className="mt-2 flex items-center space-x-4 text-sm">
                                <span className="text-gray-500">Price: <span className="font-medium">$12.50</span> per credit</span>
                                <span className="text-gray-500">Vintage: <span className="font-medium">2024</span></span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                              Buy Credits
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <TreePine className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">Seagrass Restoration Credits</h5>
                              <p className="text-sm text-gray-600">Florida Keys, USA • 800 credits available</p>
                              <div className="mt-2 flex items-center space-x-4 text-sm">
                                <span className="text-gray-500">Price: <span className="font-medium">$15.75</span> per credit</span>
                                <span className="text-gray-500">Vintage: <span className="font-medium">2024</span></span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                              Buy Credits
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Market Statistics */}
                  <div className="col-span-full">
                    <h4 className="font-medium text-gray-900 mb-4">Market Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Total Volume</div>
                        <div className="text-xl font-bold text-gray-900">89.2K</div>
                        <div className="text-sm text-green-600">+12.5% this month</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Avg. Price</div>
                        <div className="text-xl font-bold text-gray-900">$14.25</div>
                        <div className="text-sm text-red-600">-2.1% this month</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Active Listings</div>
                        <div className="text-xl font-bold text-gray-900">247</div>
                        <div className="text-sm text-blue-600">+8.3% this month</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Market Cap</div>
                        <div className="text-xl font-bold text-gray-900">$1.27M</div>
                        <div className="text-sm text-green-600">+18.2% this month</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setActiveSection('transfer')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-4"
                  >
                    List Credits for Sale
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    View Transaction History
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-4 backdrop-blur-md bg-white/95">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/bluecarbon3.png" 
                alt="Blue Carbon Registry" 
                className="h-10 w-10 rounded-full"
              />
              <h1 className="text-xl font-bold text-gray-900">Blue Carbon Registry</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <WalletMultiButton />
          </div>
        </div>
      </div>

      <div className="flex pt-20">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-20 bottom-0 w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 shadow-lg overflow-y-auto">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img 
                src="/bluecarbon3.png" 
                alt="Blue Carbon Registry" 
                className="h-8 w-8 rounded-full"
              />
              <span className="font-bold text-gray-900 text-sm">Blue Carbon</span>
            </div>
          </div>
          
          <nav className="p-6 space-y-3 pb-20">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SidebarSection)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md ${
                    isActive
                      ? `${item.bgColor} ${item.textColor} border-2 ${item.borderColor} shadow-md`
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${
                    isActive 
                      ? `bg-white shadow-sm`
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isActive 
                        ? item.iconColor
                        : 'text-gray-500'
                    }`} />
                  </div>
                  <span className="flex-1 text-left font-bold tracking-wide">{item.label}</span>
                  {isActive && (
                    <div className={`p-1 rounded-full ${item.bgColor}`}>
                      <ChevronRight className={`h-4 w-4 ${item.iconColor}`} />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gradient-to-t from-gray-50">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500">Powered by Solana</p>
              <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-64 p-6 max-w-full overflow-hidden">
          {!connected ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <img 
                  src="/bluecarbon3.png" 
                  alt="Blue Carbon Registry" 
                  className="h-24 w-24 mx-auto mb-4 rounded-full shadow-lg"
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Blue Carbon Registry</h2>
                <p className="text-gray-600 mb-6">
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