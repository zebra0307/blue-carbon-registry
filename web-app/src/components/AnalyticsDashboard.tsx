'use client';

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { fetchUserProjects } from '@/utils/projectService';
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
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalCreditsIssued: 0,
    totalCreditsRetired: 0,
    totalProjects: 0,
    activeProjects: 0,
    avgCreditPrice: 0,
    totalTransactions: 0,
    carbonImpact: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('6months');

  // Fetch real analytics data from blockchain
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!connected || !publicKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const wallet = { publicKey, connected };
        const projects = await fetchUserProjects(publicKey, wallet);
        
        if (projects.success && projects.projects) {
          // Calculate real analytics from blockchain data
          const totalProjects = projects.projects.length;
          const activeProjects = projects.projects.filter((p: any) => p.isActive).length;
          let totalCreditsIssued = 0;

          projects.projects.forEach((project: any) => {
            totalCreditsIssued += project.carbonCredits || 0;
          });

          setAnalyticsData({
            totalCreditsIssued,
            totalCreditsRetired: 0, // To be implemented with transaction history
            totalProjects,
            activeProjects,
            avgCreditPrice: 0, // To be implemented with marketplace data
            totalTransactions: 0, // To be implemented with transaction history
            carbonImpact: totalCreditsIssued, // Assuming 1:1 ratio for now
            monthlyGrowth: 0 // To be calculated with historical data
          });
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [connected, publicKey, timeframe]);

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
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-emerald-25">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-emerald-700 tracking-tight">Analytics Dashboard</h3>
              <p className="text-sm font-semibold text-emerald-600 mt-2 tracking-wide">
                Comprehensive insights into blue carbon credit ecosystem
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
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
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold transition-colors"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Credits Issued</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : analyticsData.totalCreditsIssued.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {connected ? 'Live blockchain data' : 'Connect wallet to view'}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : analyticsData.totalCreditsRetired.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Coming soon</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Flame className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : analyticsData.activeProjects}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {connected ? `out of ${analyticsData.totalProjects} total` : 'Connect wallet to view'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TreePine className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Credit Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${loading ? '...' : analyticsData.avgCreditPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Marketplace coming soon</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Flow Chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Carbon Credit Flow</h3>
            <p className="text-sm text-gray-600">Monthly trends for credit issuance, retirement, and trading</p>
          </div>
          <div className="p-6">
            {/* Simple bar chart representation */}
            <div className="space-y-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 text-xs font-medium text-gray-600">{data.month}</div>
                  <div className="flex-1 flex space-x-1">
                    <div 
                      className="bg-blue-500 h-6 rounded-sm flex items-center justify-center"
                      style={{ width: `${(data.issued / 35000) * 100}%`, minWidth: '20px' }}
                    >
                      <span className="text-xs text-white font-medium">{(data.issued / 1000).toFixed(0)}k</span>
                    </div>
                    <div 
                      className="bg-red-500 h-6 rounded-sm flex items-center justify-center"
                      style={{ width: `${(data.retired / 35000) * 100}%`, minWidth: '20px' }}
                    >
                      <span className="text-xs text-white font-medium">{(data.retired / 1000).toFixed(0)}k</span>
                    </div>
                    <div 
                      className="bg-green-500 h-6 rounded-sm flex items-center justify-center"
                      style={{ width: `${(data.traded / 35000) * 100}%`, minWidth: '20px' }}
                    >
                      <span className="text-xs text-white font-medium">{(data.traded / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                <span>Issued</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                <span>Retired</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                <span>Traded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Environmental Impact</h3>
            <p className="text-sm text-gray-600">Real-world carbon offset achievements</p>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {analyticsData.carbonImpact.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">tonnes CO₂ offset potential</div>
              <div className="text-xs text-blue-600 mt-1">
                {connected ? 'Based on registered projects' : 'Connect wallet to view impact'}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TreePine className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <p className="text-sm text-gray-600">Latest carbon credit activities</p>
        </div>
        <div className="p-8 text-center">
          <div className="mb-4">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Transaction History Coming Soon</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Real-time transaction tracking is under development. This will show actual mint, transfer, 
              and retirement activities from the Solana blockchain.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-4 max-w-md mx-auto">
            <p className="text-sm text-blue-700">
              <strong>Next Update:</strong> Integration with Solana transaction history API 
              to display real credit activities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}