'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Layout } from '@/components/Navigation';
import { 
  Users, 
  Building2, 
  Award, 
  TrendingUp,
  Settings,
  Database,
  Shield,
  Activity,
  DollarSign,
  TreePine,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Globe
} from 'lucide-react';
import { getAllProjects, getGlobalRegistryData, initializeRegistry } from '@/utils/solana';
import { useRegistryStats } from '@/hooks/useBlockchainData';

interface AdminStats {
  totalProjects: number;
  totalCredits: number;
  totalValidators: number;
  totalUsers: number;
  pendingProjects: number;
  verifiedProjects: number;
  rejectedProjects: number;
  totalValue: number;
}

function AdminDashboardContent() {
  const wallet = useWallet();
  const { stats: registryStats, loading: statsLoading, error: statsError, refetch } = useRegistryStats();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalProjects: 0,
    totalCredits: 0,
    totalValidators: 0,
    totalUsers: 0,
    pendingProjects: 0,
    verifiedProjects: 0,
    rejectedProjects: 0,
    totalValue: 0
  });

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      if (!wallet.connected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get all projects
        const projectsResponse = await getAllProjects(wallet);
        let allProjects: any[] = [];
        
        if (projectsResponse.success && projectsResponse.projects) {
          allProjects = projectsResponse.projects;
          setProjects(allProjects);
        }

        // Calculate admin statistics
        const pendingCount = allProjects.filter(p => !p.verificationStatus).length;
        const verifiedCount = allProjects.filter(p => p.verificationStatus).length;
        const totalCredits = allProjects.reduce((sum, p) => sum + (p.creditsIssued || 0), 0);
        
        setAdminStats({
          totalProjects: allProjects.length,
          totalCredits: totalCredits,
          totalValidators: 5, // Mock data - in real app, query validator accounts
          totalUsers: 25, // Mock data - in real app, query user accounts
          pendingProjects: pendingCount,
          verifiedProjects: verifiedCount,
          rejectedProjects: 0, // Mock data
          totalValue: totalCredits * 25.50 // Estimated value at $25.50 per credit
        });

        setError(null);
      } catch (err: any) {
        console.error('Error loading admin data:', err);
        setError(err.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [wallet.connected]);

  const handleInitializeRegistry = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const result = await initializeRegistry(wallet);
      if (result.success) {
        alert('Registry initialized successfully!');
        // Reload data
        refetch();
      } else {
        throw new Error(result.error || 'Initialization failed');
      }
    } catch (error: any) {
      console.error('Initialization error:', error);
      alert(`Initialization failed: ${error.message}`);
    }
  };

  const exportData = () => {
    // Export project data as CSV
    const csvData = projects.map(project => ({
      ProjectID: project.projectId,
      Owner: project.owner,
      CarbonTons: project.carbonTonsEstimated,
      Credits: project.creditsIssued,
      Status: project.verificationStatus ? 'Verified' : 'Pending',
      IPFS: project.ipfsCid
    }));
    
    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blue-carbon-registry-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!wallet.connected) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">System administration and registry management</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Admin Access Required</h3>
          <p className="text-red-600 mb-4">Please connect your admin wallet to access this dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Loading system data...</p>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">System administration and registry management</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Credits Issued</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.totalCredits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${adminStats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Project Status</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Verified</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{adminStats.verifiedProjects}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{adminStats.pendingProjects}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{adminStats.rejectedProjects}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Registry Stats</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Projects</span>
              <span className="text-sm font-medium text-gray-900">{registryStats.totalProjects}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Carbon Sequestered</span>
              <span className="text-sm font-medium text-gray-900">{registryStats.carbonSequestered.toLocaleString()} tons</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ecosystem Area</span>
              <span className="text-sm font-medium text-gray-900">{registryStats.ecosystemArea.toLocaleString()} hectares</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Blockchain Status</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">IPFS Gateway</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Validators</span>
              <span className="text-sm font-medium text-gray-900">{adminStats.totalValidators} Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Administration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleInitializeRegistry}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Database className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Initialize Registry</span>
          </button>
          
          <button
            onClick={() => alert('Feature coming soon')}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Manage Validators</span>
          </button>
          
          <button
            onClick={() => alert('Feature coming soon')}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600" />
            <span className="font-medium">System Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
          <Globe className="h-5 w-5 text-gray-400" />
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <TreePine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No projects in the registry yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carbon Tons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.slice(0, 10).map((project, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.projectId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.owner.slice(0, 8)}...{project.owner.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.carbonTonsEstimated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.verificationStatus 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.verificationStatus ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.creditsIssued || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Layout>
      <AdminDashboardContent />
    </Layout>
  );
}