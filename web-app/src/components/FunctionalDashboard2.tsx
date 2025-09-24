'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  TreePine, 
  Building2, 
  Coins, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Filter,
  Download
} from 'lucide-react';

export default function FunctionalDashboard2() {
  const { connected } = useWallet();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const projects = [
    { id: 'BCR-001', name: 'Mangrove Restoration Indonesia', type: 'Mangrove', status: 'Active', credits: 500, progress: 75 },
    { id: 'BCR-002', name: 'Seagrass Conservation Australia', type: 'Seagrass', status: 'Pending', credits: 300, progress: 45 },
    { id: 'BCR-003', name: 'Kelp Forest Protection Canada', type: 'Kelp', status: 'Active', credits: 450, progress: 90 },
    { id: 'BCR-004', name: 'Salt Marsh Restoration UK', type: 'Salt Marsh', status: 'Completed', credits: 600, progress: 100 },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesFilter = activeFilter === 'all' || project.status.toLowerCase() === activeFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Blue Carbon Dashboard v2</h1>
            <p className="text-blue-100">Advanced monitoring and management system</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
              <p className="text-sm text-green-600">↗ 12% from last month</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credits</p>
              <p className="text-3xl font-bold text-gray-900">1,850</p>
              <p className="text-sm text-green-600">↗ 8% from last month</p>
            </div>
            <Coins className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Value</p>
              <p className="text-3xl font-bold text-gray-900">$185K</p>
              <p className="text-sm text-green-600">↗ 15% from last month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">24</p>
              <p className="text-sm text-green-600">↗ 4% from last month</p>
            </div>
            <Users className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Enhanced Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <TreePine className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  project.status === 'Active' ? 'bg-green-100 text-green-800' :
                  project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium text-gray-900">{project.type}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Credits:</span>
                  <span className="text-sm font-medium text-gray-900">{project.credits}</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-100">
                  View Details
                </button>
                <button className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded text-sm hover:bg-green-100">
                  Manage Credits
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance Analytics</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart visualization would appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}