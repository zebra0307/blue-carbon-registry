'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Zap,
  Shield, 
  Globe, 
  Leaf, 
  Activity, 
  Target,
  Download,
  RefreshCw,
  ArrowUpRight
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

export default function DashboardContent() {
  const { connected, publicKey } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h2>
          <p className="text-gray-500">Fetching latest project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome to Blue Carbon Registry
            </h1>
            <p className="text-blue-100 lg:text-lg">
              {connected 
                ? `Connected as ${publicKey?.toBase58().slice(0, 8)}...${publicKey?.toBase58().slice(-8)}`
                : 'Connect your wallet to access the full dashboard'
              }
            </p>
          </div>
          <div className="hidden lg:block">
            <TreePine className="h-16 w-16 text-blue-200" />
          </div>
        </div>
        
        {connected && (
          <div className="mt-4 flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Connected to Solana Mainnet</span>
            <span className="mx-2">•</span>
            <span>Last sync: 2 minutes ago</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
            View all <ArrowUpRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors group">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Register Project</span>
            <span className="text-xs text-gray-500 mt-1">New carbon project</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors group">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Mint Credits</span>
            <span className="text-xs text-gray-500 mt-1">Create new credits</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors group">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Verify Project</span>
            <span className="text-xs text-gray-500 mt-1">Submit for verification</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors group">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Retire Credits</span>
            <span className="text-xs text-gray-500 mt-1">Offset carbon</span>
          </button>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
            View all projects <ArrowUpRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer overflow-hidden group"
            >
              <div className="h-32 bg-gradient-to-br from-blue-100 to-green-100 relative">
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{project.status}</span>
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded p-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h4>
                <p className="text-sm text-gray-500 flex items-center mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  {project.location}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Credits Available</span>
                    <span className="font-medium">{project.creditsAvailable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Price per Credit</span>
                    <span className="font-medium text-green-600">${project.price}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Award className="h-3 w-3" />
                      <span>{project.certificationStandard}</span>
                    </div>
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium">
                      <span>View Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Project Verified', project: 'Sundarbans Mangrove', time: '2 hours ago', type: 'success' },
              { action: 'Credits Minted', project: 'Great Barrier Reef', time: '4 hours ago', type: 'info' },
              { action: 'Project Registered', project: 'Florida Everglades', time: '1 day ago', type: 'warning' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`h-2 w-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' : 
                  activity.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.project} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Blockchain Status</p>
                  <p className="text-xs text-green-600">All systems operational</p>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600">99.9% uptime</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Network Activity</p>
                  <p className="text-xs text-blue-600">Active monitoring enabled</p>
                </div>
              </div>
              <span className="text-xs font-medium text-blue-600">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}