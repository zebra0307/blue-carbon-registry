'use client';

import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  TreePine, 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Award, 
  ChevronRight, 
  Filter, 
  Search, 
  Bell, 
  Settings, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MoreHorizontal, 
  Plus, 
  Zap,
  Shield, 
  Globe, 
  Leaf, 
  Activity, 
  Target,
  Download,
  RefreshCw
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  creditsIssued: number;
  creditsAvailable: number;
  price: number;
  progress: number;
  developer: string;
  certificationStandard: string;
  vintage: number;
  areaSize: number;
  carbonSequestered: number;
  description: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Sundarbans Mangrove Restoration',
    location: 'Bangladesh',
    type: 'Mangrove Restoration',
    status: 'Active',
    creditsIssued: 45000,
    creditsAvailable: 32000,
    price: 25.50,
    progress: 78,
    developer: 'Blue Carbon Solutions Ltd.',
    certificationStandard: 'VCS',
    vintage: 2024,
    areaSize: 850,
    carbonSequestered: 12500,
    description: 'Large-scale mangrove restoration project protecting coastal communities.'
  },
  {
    id: '2',
    name: 'Great Barrier Reef Seagrass Conservation',
    location: 'Australia',
    type: 'Seagrass Conservation',
    status: 'Verified',
    creditsIssued: 28000,
    creditsAvailable: 28000,
    price: 32.75,
    progress: 95,
    developer: 'Marine Conservation Australia',
    certificationStandard: 'Gold Standard',
    vintage: 2023,
    areaSize: 1200,
    carbonSequestered: 8500,
    description: 'Comprehensive seagrass restoration and conservation program.'
  },
  {
    id: '3',
    name: 'Florida Everglades Wetland Protection',
    location: 'USA',
    type: 'Wetland Protection',
    status: 'Pending',
    creditsIssued: 0,
    creditsAvailable: 0,
    price: 28.00,
    progress: 35,
    developer: 'Everglades Conservation Trust',
    certificationStandard: 'Climate Action Reserve',
    vintage: 2024,
    areaSize: 2500,
    carbonSequestered: 0,
    description: 'Extensive wetland protection and restoration project.'
  }
];

const dashboardStats = [
  {
    title: 'Total Projects',
    value: '24',
    change: '+3',
    icon: TreePine,
    description: 'Active blue carbon projects'
  },
  {
    title: 'Credits Available',
    value: '487K',
    change: '+12%',
    icon: Leaf,
    description: 'Verified carbon credits'
  },
  {
    title: 'Total Investment',
    value: '$12.8M',
    change: '+8%',
    icon: DollarSign,
    description: 'Capital deployed'
  },
  {
    title: 'Carbon Sequestered',
    value: '125K tCO₂',
    change: '+15%',
    icon: Globe,
    description: 'Total carbon captured'
  },
  {
    title: 'Ecosystem Area',
    value: '8,500 ha',
    change: '+22%',
    icon: MapPin,
    description: 'Protected ecosystem area'
  },
  {
    title: 'Community Impact',
    value: '45K',
    change: '+18%',
    icon: Users,
    description: 'People benefited'
  }
];

export default function ComplexDashboard() {
  const { connected, publicKey } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
    const matchesType = filterType === 'All' || project.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'credits':
        return b.creditsAvailable - a.creditsAvailable;
      case 'price':
        return b.price - a.price;
      case 'progress':
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'Verified':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Verified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Blue Carbon Registry</h2>
          <p className="text-gray-500">Initializing comprehensive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TreePine className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Blue Carbon Registry</h1>
                  <p className="text-xs text-gray-500">Comprehensive Project Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, locations..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </button>

              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-5 w-5" />
              </button>

              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />

              {connected && (
                <div className="flex items-center space-x-2">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900">Connected</p>
                    <p className="text-xs text-gray-500">
                      {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                    </p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-500">
                    <User className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {connected && (
          <div className="bg-green-50 border-b border-green-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Wallet connected to Solana Mainnet</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-green-700">
                  <span>Last sync: 2 min ago</span>
                  <button className="flex items-center space-x-1 hover:text-green-900">
                    <RefreshCw className="h-3 w-3" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {['overview', 'projects', 'analytics', 'monitoring'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className="text-sm font-medium text-green-600">{stat.change}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <stat.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">Register Project</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Zap className="h-6 w-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium">Mint Credits</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Shield className="h-6 w-6 text-purple-600 mb-2" />
                  <span className="text-sm font-medium">Verify Project</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Target className="h-6 w-6 text-orange-600 mb-2" />
                  <span className="text-sm font-medium">Retire Credits</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 relative">
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{project.status}</span>
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {project.location}
                        </p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Credits Available</span>
                        <span className="font-medium">{project.creditsAvailable.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price per Credit</span>
                        <span className="font-medium text-green-600">${project.price}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Award className="h-4 w-4" />
                          <span>{project.certificationStandard}</span>
                        </div>
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                          <span className="text-sm font-medium">View Details</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-900">$3.8M</p>
                      <p className="text-xs text-blue-600">+22% from last month</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Credit Velocity</p>
                      <p className="text-2xl font-bold text-green-900">85%</p>
                      <p className="text-xs text-green-600">+15% efficiency</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Market Share</p>
                      <p className="text-2xl font-bold text-purple-900">12.3%</p>
                      <p className="text-xs text-purple-600">Blue carbon sector</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Monitoring</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">System Status</p>
                      <p className="text-sm text-green-600">All systems operational</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">99.9% uptime</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Active Monitoring</p>
                      <p className="text-sm text-blue-600">Projects under surveillance</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-medium">Live</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                  <p className="text-gray-500 mt-1">{selectedProject.developer}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Project Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{selectedProject.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium">{selectedProject.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Financial Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credits Available</span>
                      <span className="font-medium">{selectedProject.creditsAvailable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per Credit</span>
                      <span className="font-medium text-green-600">${selectedProject.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Project Description</h3>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>

              <div className="mt-6 flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Purchase Credits
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  View Documents
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
