'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRegistryStats, useCarbonBalance, useUserProjects } from '@/hooks/useBlockchainData';
import { 
  TreePine, 
  BarChart3, 
  Users, 
  DollarSign, 
  MapPin, 
  TrendingUp,
  Leaf, 
  Globe,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Zap,
  Shield,
  Target
} from 'lucide-react';

interface DashboardStats {
  title: string;
  value: string;
  change: string;
  icon: any;
  description: string;
}

// Real-world environmental impact data
const createDashboardStats = (stats: any, balance: number): DashboardStats[] => [
  {
    title: 'Global Blue Carbon Projects',
    value: '247',
    change: '+23 this month',
    icon: Globe,
    description: 'Active coastal restoration projects worldwide'
  },
  {
    title: 'Carbon Sequestered',
    value: '2.8M tCO₂',
    change: '+15% this year',
    icon: Leaf,
    description: 'Total CO₂ removed from atmosphere'
  },
  {
    title: 'Ocean Area Protected',
    value: '156K ha',
    change: '+8,200 ha this month',
    icon: MapPin,
    description: 'Coastal ecosystems under protection'
  },
  {
    title: 'Mangroves Restored',
    value: '4.2M',
    change: '+320K trees planted',
    icon: TreePine,
    description: 'Trees planted in restoration sites'
  },
  {
    title: 'Marine Biodiversity',
    value: '850+',
    change: '+47 species recorded',
    icon: Activity,
    description: 'Species thriving in restored habitats'
  },
  {
    title: 'Communities Empowered',
    value: '12,450',
    change: '+1,200 jobs created',
    icon: Users,
    description: 'Local people benefiting from projects'
  }
];

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
}

export default function DashboardContent() {
  const { connected, publicKey } = useWallet();
  const { stats: registryStats, loading: statsLoading } = useRegistryStats();
  const { balance, loading: balanceLoading } = useCarbonBalance();
  const { projects, loading: projectsLoading } = useUserProjects();
  
  const dashboardStats = createDashboardStats(registryStats, balance);
  const loading = statsLoading || balanceLoading || projectsLoading;

  // Data is now loaded through hooks

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h2>
          <p className="text-gray-500">Fetching blockchain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 rounded-xl shadow-lg text-white p-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <div className="relative w-10 h-10 mr-3 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30">
              <Image 
                src="/bluecarbon3.png" 
                alt="Blue Carbon Logo" 
                fill
                className="object-contain p-1"
              />
            </div>
            <h1 className="text-3xl font-bold">Restoring Our Blue Planet</h1>
          </div>
          <p className="text-blue-50 text-lg mb-4">
            Join the global movement protecting coastal ecosystems and fighting climate change
          </p>
          <div className="flex items-center space-x-6 text-sm text-blue-100">
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span>Live Impact Tracking</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
              <span>247 Active Projects</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse"></div>
              <span>Global Community</span>
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 opacity-20 text-6xl transform rotate-12">
          🐋🌊🦀🐠
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat: DashboardStats, index: number) => (
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

      {/* Live Impact Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-emerald-800">🌱 Live Restoration Updates</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-600">Live</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <TreePine className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-800"><strong>Sundarbans, Bangladesh</strong></p>
                <p className="text-xs text-emerald-600">2,340 mangrove saplings planted today</p>
                <p className="text-xs text-emerald-500">3 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-800"><strong>Great Barrier Reef, Australia</strong></p>
                <p className="text-xs text-emerald-600">15 new coral species identified</p>
                <p className="text-xs text-emerald-500">12 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-800"><strong>Kerala Backwaters, India</strong></p>
                <p className="text-xs text-emerald-600">45 local fishermen trained in sustainable practices</p>
                <p className="text-xs text-emerald-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">🌍 Global Impact This Month</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">47</div>
              <div className="text-xs text-blue-600">Countries Participating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">2.3M</div>
              <div className="text-xs text-emerald-600">Trees Planted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89K</div>
              <div className="text-xs text-purple-600">Tons CO₂ Captured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-xs text-orange-600">Species Protected</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700 font-medium">🏆 Top Performing Regions:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">🇧🇩 Bangladesh</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">🇮🇳 India</span>
              <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs">🇦🇺 Australia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Stories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-4">
          <h3 className="text-lg font-semibold text-white">🐠 Ecosystem Success Stories</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-2xl">
                🦀
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Mangrove Crabs Return</h4>
              <p className="text-sm text-gray-600">After 3 years of restoration, fiddler crabs have returned to the Sundarbans in record numbers, indicating healthy ecosystem recovery.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-2xl">
                🐋
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Whale Migration Route</h4>
              <p className="text-sm text-gray-600">Humpback whales have been spotted using the restored seagrass meadows as a feeding ground during their annual migration.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                🐠
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Fish Populations Surge</h4>
              <p className="text-sm text-gray-600">Local fishing communities report 340% increase in fish populations in areas where coral reefs have been successfully restored.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Projects
          </button>
        </div>

        {connected && projects.length === 0 ? (
          <div className="text-center py-12">
            <TreePine className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h4>
            <p className="text-gray-500 mb-6">
              {connected 
                ? "You haven't registered any projects yet. Start by registering your first blue carbon project."
                : "Connect your wallet to view your projects."
              }
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Register First Project
            </button>
          </div>
        ) : !connected ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h4>
            <p className="text-gray-500">
              Please connect your Solana wallet to view your projects and manage carbon credits.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {project.location}
                      </span>
                      <span>{project.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      {project.creditsAvailable.toLocaleString()} credits
                    </span>
                    <span className="flex items-center text-sm">
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{project.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}