'use client';

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRegistryStats, useAllProjects, useCarbonBalance } from '@/hooks/useBlockchainData';
import { 
  TrendingUp, 
  Coins, 
  Users, 
  Activity,
  BarChart3,
  PieChart,
  TreePine,
  Flame,
  ArrowUpDown,
  DollarSign
} from 'lucide-react';

// Real analytics data interface
interface AnalyticsData {
  totalCreditsIssued: number;
  totalCreditsRetired: number;
  totalProjects: number;
  activeProjects: number;
  avgCreditPrice: number;
  totalTransactions: number;
  carbonImpact: number;
  monthlyGrowth: number;
}

interface ChartData {
  month: string;
  issued: number;
  retired: number;
  traded: number;
}

export default function AnalyticsDashboard() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  // Use real blockchain hooks
  const { stats: registryStats, loading: statsLoading } = useRegistryStats();
  const { projects: allProjects, loading: projectsLoading } = useAllProjects();
  const { balance: carbonBalance, loading: balanceLoading } = useCarbonBalance();
  
  const [timeframe, setTimeframe] = useState('6months');

  // Calculate analytics from real blockchain data
  const loading = statsLoading || projectsLoading || balanceLoading;
  
  const analyticsData: AnalyticsData = {
    totalCreditsIssued: registryStats?.totalCredits || 0,
    totalCreditsRetired: 0, // Not available in current RegistryStats interface
    totalProjects: registryStats?.totalProjects || allProjects?.length || 0,
    activeProjects: allProjects?.filter(p => p.status === 'Active' || p.status === 'Verified')?.length || 0,
    avgCreditPrice: 25.50, // Will be calculated from marketplace data when available
    totalTransactions: 0, // Not available in current RegistryStats interface
    carbonImpact: registryStats?.carbonSequestered || registryStats?.totalCredits || 0,
    monthlyGrowth: 0 // Not available in current RegistryStats interface - to be calculated
  };

  // Export functionality
  const exportAnalyticsReport = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Prepare CSV data with real analytics
    const reportData = [
      ['Blue Carbon Registry Analytics Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Time Period: ${timeframe}`],
      [`Wallet: ${publicKey?.toString() || 'Not Connected'}`],
      [''],
      ['SUMMARY METRICS'],
      ['Metric', 'Value', 'Status'],
      ['Total Credits Issued', analyticsData.totalCreditsIssued.toLocaleString(), 'Live Data'],
      ['Total Credits Retired', analyticsData.totalCreditsRetired.toLocaleString(), 'Coming Soon'],
      ['Active Projects', analyticsData.activeProjects.toString(), `${analyticsData.totalProjects} total`],
      ['Average Credit Price', `$${analyticsData.avgCreditPrice}`, 'Coming Soon'],
      ['Total Transactions', analyticsData.totalTransactions.toLocaleString(), 'Coming Soon'],
      ['Carbon Impact (tonnes CO₂)', analyticsData.carbonImpact.toLocaleString(), 'Live Data'],
      [''],
      ['NOTES'],
      ['This report shows real blockchain data where available.'],
      ['Some metrics are marked "Coming Soon" and will be implemented with transaction history tracking.'],
      ['Connect your wallet to view personalized analytics.'],
    ];

    // Convert to CSV format
    const csvContent = reportData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `blue-carbon-analytics-${currentDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert(`Analytics report exported successfully!\nFile: blue-carbon-analytics-${currentDate}.csv`);
    }
  };

  // Chart data - will be populated with real data in future updates
  const [chartData] = useState<ChartData[]>([
    // Empty for now - will be populated with real blockchain transaction data
    { month: 'Current', issued: analyticsData.totalCreditsIssued, retired: analyticsData.totalCreditsRetired, traded: 0 },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-emerald-25">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-emerald-700 tracking-tight">Analytics Dashboard</h3>
              <p className="text-sm font-semibold text-emerald-600 mt-1 md:mt-2 tracking-wide">
                Comprehensive insights into blue carbon credit ecosystem
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium min-w-0 flex-1 sm:flex-none"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="30days">Last 30 days</option>
                <option value="3months">Last 3 months</option>
                <option value="6months">Last 6 months</option>
                <option value="1year">Last year</option>
              </select>
              <button 
                onClick={exportAnalyticsReport}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Total Credits Issued</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {loading ? '...' : analyticsData.totalCreditsIssued.toLocaleString()}
              </p>
              <p className="text-xs lg:text-sm text-blue-600 mt-1">
                {connected ? 'Live blockchain data' : 'Connect wallet to view'}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-orange-100 rounded-lg flex-shrink-0 ml-2">
              <Coins className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Credits Retired</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {loading ? '...' : analyticsData.totalCreditsRetired.toLocaleString()}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Coming soon</p>
            </div>
            <div className="p-2 lg:p-3 bg-red-100 rounded-lg flex-shrink-0 ml-2">
              <Flame className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {loading ? '...' : analyticsData.activeProjects}
              </p>
              <p className="text-xs lg:text-sm text-blue-600 mt-1">
                {connected ? `out of ${analyticsData.totalProjects} total` : 'Connect wallet to view'}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-blue-100 rounded-lg flex-shrink-0 ml-2">
              <TreePine className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Avg. Credit Price</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                ${loading ? '...' : analyticsData.avgCreditPrice.toFixed(2)}
              </p>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Marketplace coming soon</p>
            </div>
            <div className="p-2 lg:p-3 bg-green-100 rounded-lg flex-shrink-0 ml-2">
              <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Project Analysis Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">All Blockchain Projects</h3>
          <p className="text-xs lg:text-sm text-gray-600">Complete registry analysis with approval status and carbon credits</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Issued</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CO₂ Impact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ecosystem</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-500">Loading blockchain data...</span>
                    </div>
                  </td>
                </tr>
              ) : !connected ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <p className="mb-2">Connect your wallet to view blockchain projects</p>
                      <p className="text-sm text-gray-400">Real project data will be displayed from Solana blockchain</p>
                    </div>
                  </td>
                </tr>
              ) : allProjects && allProjects.length > 0 ? (
                allProjects.map((project, index) => {
                  const getStatusColor = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'active':
                      case 'verified':
                        return 'bg-green-100 text-green-800';
                      case 'pending':
                        return 'bg-yellow-100 text-yellow-800';
                      case 'rejected':
                        return 'bg-red-100 text-red-800';
                      default:
                        return 'bg-gray-100 text-gray-800';
                    }
                  };

                  const getIconColor = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'active':
                      case 'verified':
                        return 'bg-emerald-100 text-emerald-600';
                      case 'pending':
                        return 'bg-yellow-100 text-yellow-600';
                      case 'rejected':
                        return 'bg-red-100 text-red-600';
                      default:
                        return 'bg-gray-100 text-gray-600';
                    }
                  };

                  return (
                    <tr key={project.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getIconColor(project.status)}`}>
                              <TreePine className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">Project ID: {project.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.creditsIssued?.toLocaleString() || 0} tCO₂
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.creditsIssued?.toLocaleString() || 0} tonnes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.type}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <TreePine className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="mb-2">No projects found on blockchain</p>
                      <p className="text-sm text-gray-400">Register your first project to see data here</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Showing {connected && allProjects ? `${allProjects.length} blockchain projects` : 'Connect wallet for real blockchain data'}</p>
            <div className="flex space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active ({connected && allProjects ? allProjects.filter(p => p.status === 'Active' || p.status === 'Verified').length : 'N/A'})
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                Pending ({connected && allProjects ? allProjects.filter(p => p.status === 'Pending').length : 'N/A'})
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Rejected ({connected && allProjects ? allProjects.filter(p => p.status === 'Rejected').length : 'N/A'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <p className="text-xs lg:text-sm text-gray-600">Latest carbon credit activities</p>
        </div>
        <div className="p-4 lg:p-8 text-center">
          <div className="mb-4">
            <Activity className="h-8 w-8 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Transaction History Coming Soon</h4>
            <p className="text-sm lg:text-base text-gray-600 max-w-md mx-auto">
              Real-time transaction tracking is under development. This will show actual mint, transfer, 
              and retirement activities from the Solana blockchain.
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 lg:p-4 rounded-lg mt-4 max-w-md mx-auto">
            <p className="text-xs lg:text-sm text-blue-700">
              <strong>Next Update:</strong> Integration with Solana transaction history API 
              to display real credit activities
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Credit Flow Chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Carbon Credit Flow</h3>
            <p className="text-xs lg:text-sm text-gray-600">Monthly trends for credit issuance, retirement, and trading</p>
          </div>
          <div className="p-4 lg:p-6">
            {/* Simple bar chart representation */}
            <div className="space-y-3 lg:space-y-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex items-center space-x-2 lg:space-x-4">
                  <div className="w-6 lg:w-8 text-xs font-medium text-gray-600 flex-shrink-0">{data.month}</div>
                  <div className="flex-1 flex space-x-1 min-w-0">
                    <div 
                      className="bg-blue-500 h-5 lg:h-6 rounded-sm flex items-center justify-center"
                      style={{ width: `${(data.issued / 35000) * 100}%`, minWidth: '16px' }}
                    >
                      <span className="text-xs text-white font-medium hidden sm:inline">{(data.issued / 1000).toFixed(0)}k</span>
                    </div>
                    <div 
                      className="bg-red-500 h-5 lg:h-6 rounded-sm flex items-center justify-center"
                      style={{ width: `${(data.retired / 35000) * 100}%`, minWidth: '16px' }}
                    >
                      <span className="text-xs text-white font-medium hidden sm:inline">{(data.retired / 1000).toFixed(0)}k</span>
                    </div>
                    <div 
                      className="bg-green-500 h-5 lg:h-6 rounded-sm flex items-center justify-center"
                      style={{ width: `${(data.traded / 35000) * 100}%`, minWidth: '16px' }}
                    >
                      <span className="text-xs text-white font-medium hidden sm:inline">{(data.traded / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center space-x-3 lg:space-x-6 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1 lg:mr-2"></div>
                <span>Issued</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-sm mr-1 lg:mr-2"></div>
                <span>Retired</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm mr-1 lg:mr-2"></div>
                <span>Traded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Environmental Impact</h3>
            <p className="text-xs lg:text-sm text-gray-600">Real-world carbon offset achievements</p>
          </div>
          <div className="p-4 lg:p-6">
            <div className="text-center mb-4 lg:mb-6">
              <div className="text-2xl lg:text-4xl font-bold text-green-600 mb-2">
                {analyticsData.carbonImpact.toLocaleString()}
              </div>
              <div className="text-xs lg:text-sm text-gray-600">tonnes CO₂ offset potential</div>
              <div className="text-xs text-blue-600 mt-1">
                {connected ? 'Based on registered projects' : 'Connect wallet to view impact'}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-3 lg:p-4 bg-gray-50 rounded-lg">
                <TreePine className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Detailed impact breakdown coming soon
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Will categorize by ecosystem type and project phase
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}