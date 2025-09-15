'use client';

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
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

// Mock data for analytics
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
  const { publicKey } = useWallet();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalCreditsIssued: 234500,
    totalCreditsRetired: 89200,
    totalProjects: 47,
    activeProjects: 42,
    avgCreditPrice: 14.25,
    totalTransactions: 1256,
    carbonImpact: 89200,
    monthlyGrowth: 12.5
  });

  // Export functionality
  const exportAnalyticsReport = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Prepare CSV data
    const reportData = [
      ['Blue Carbon Registry Analytics Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Time Period: ${timeframe}`],
      [`Wallet: ${publicKey?.toString() || 'Not Connected'}`],
      [''],
      ['SUMMARY METRICS'],
      ['Metric', 'Value', 'Change'],
      ['Total Credits Issued', analyticsData.totalCreditsIssued.toLocaleString(), `+${analyticsData.monthlyGrowth}%`],
      ['Total Credits Retired', analyticsData.totalCreditsRetired.toLocaleString(), '+8.3%'],
      ['Active Projects', analyticsData.activeProjects.toString(), `${analyticsData.totalProjects} total`],
      ['Average Credit Price', `$${analyticsData.avgCreditPrice}`, '+2.1%'],
      ['Total Transactions', analyticsData.totalTransactions.toLocaleString(), '+15.7%'],
      ['Carbon Impact (tonnes CO₂)', analyticsData.carbonImpact.toLocaleString(), '+8.3%'],
      [''],
      ['MONTHLY CREDIT FLOW'],
      ['Month', 'Credits Issued', 'Credits Retired', 'Credits Traded'],
      ...chartData.map(data => [data.month, data.issued.toString(), data.retired.toString(), data.traded.toString()]),
      [''],
      ['TOP PERFORMING PROJECTS'],
      ['Project Name', 'Location', 'Credits Generated', 'Growth Rate'],
      ['Great Barrier Reef Seagrass', 'Australia', '12,500', '+15%'],
      ['Sundarbans Mangrove Protection', 'Bangladesh', '11,800', '+12%'],
      ['California Kelp Restoration', 'USA', '9,200', '+8%'],
      ['North Sea Salt Marsh', 'Netherlands', '7,500', '+6%'],
      [''],
      ['RECENT TRANSACTIONS'],
      ['Type', 'Amount', 'Project', 'User', 'Time'],
      ['Mint', '2,500', 'Mangrove Restoration', 'EcoRestore Foundation', '2 hours ago'],
      ['Transfer', '1,200', 'Seagrass Protection', 'Blue Ocean Initiative', '4 hours ago'],
      ['Retire', '800', 'Coastal Wetlands', 'GreenTech Corp', '6 hours ago'],
      ['Mint', '3,200', 'Blue Carbon Initiative', 'Marine Conservation Society', '8 hours ago'],
      ['Transfer', '1,500', 'Ocean Carbon Storage', 'Carbon Solutions Ltd', '12 hours ago'],
      [''],
      ['GEOGRAPHIC DISTRIBUTION'],
      ['Region', 'Projects', 'Percentage'],
      ['Asia-Pacific', '24', '36%'],
      ['North America', '18', '27%'],
      ['Europe', '12', '18%'],
      ['Latin America', '8', '12%'],
      ['Africa', '5', '7%'],
      [''],
      ['ENVIRONMENTAL IMPACT BREAKDOWN'],
      ['Project Type', 'CO₂ Sequestered (tonnes)'],
      ['Mangrove Projects', '45,600'],
      ['Seagrass Restoration', '28,900'],
      ['Salt Marsh Conservation', '14,700'],
      [''],
      ['MARKET ANALYTICS'],
      ['Metric', 'Value', 'Trend'],
      ['Average Price', '$14.25', 'Up 2.1%'],
      ['Highest Price (30d)', '$18.50', '-'],
      ['Lowest Price (30d)', '$11.80', '-'],
      ['Market Volatility', 'Low', 'Stable'],
      ['Market Volume', '$5.2M', 'Up 15.7%'],
      ['Active Traders', '1,249', 'Up 8.9%'],
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

  const [chartData] = useState<ChartData[]>([
    { month: 'Jan', issued: 15000, retired: 8000, traded: 12000 },
    { month: 'Feb', issued: 18000, retired: 9500, traded: 14000 },
    { month: 'Mar', issued: 22000, retired: 11000, traded: 16000 },
    { month: 'Apr', issued: 25000, retired: 12500, traded: 18000 },
    { month: 'May', issued: 28000, retired: 14000, traded: 20000 },
    { month: 'Jun', issued: 32000, retired: 16000, traded: 22000 },
  ]);

  const [timeframe, setTimeframe] = useState('6months');

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
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalCreditsIssued.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+{analyticsData.monthlyGrowth}% from last month</p>
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
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalCreditsRetired.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+8.3% from last month</p>
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
              <p className="text-2xl font-bold text-gray-900">{analyticsData.activeProjects}</p>
              <p className="text-sm text-blue-600 mt-1">out of {analyticsData.totalProjects} total</p>
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
              <p className="text-2xl font-bold text-gray-900">${analyticsData.avgCreditPrice}</p>
              <p className="text-sm text-green-600 mt-1">+2.1% from last month</p>
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
              <div className="text-sm text-gray-600">tonnes CO₂ offset</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TreePine className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Forest Carbon</span>
                </div>
                <span className="text-sm font-bold">45,600 tonnes</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">Ocean Carbon</span>
                </div>
                <span className="text-sm font-bold">28,900 tonnes</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">Soil Carbon</span>
                </div>
                <span className="text-sm font-bold">14,700 tonnes</span>
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
        <div className="divide-y divide-gray-200">
          {[
            { type: 'mint', amount: 2500, project: 'Mangrove Restoration', time: '2 hours ago', user: 'D1...8Fz' },
            { type: 'transfer', amount: 1200, project: 'Seagrass Protection', time: '4 hours ago', user: 'Ax...P9k' },
            { type: 'retire', amount: 800, project: 'Coastal Wetlands', time: '6 hours ago', user: 'G3...7Rt' },
            { type: 'mint', amount: 3200, project: 'Blue Carbon Initiative', time: '8 hours ago', user: 'K9...2Mf' },
            { type: 'transfer', amount: 1500, project: 'Ocean Carbon Storage', time: '12 hours ago', user: 'R7...6Qx' },
          ].map((tx, index) => (
            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-4 ${
                  tx.type === 'mint' ? 'bg-green-100' :
                  tx.type === 'transfer' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  {tx.type === 'mint' ? (
                    <Coins className={`h-5 w-5 ${
                      tx.type === 'mint' ? 'text-green-600' :
                      tx.type === 'transfer' ? 'text-blue-600' : 'text-red-600'
                    }`} />
                  ) : tx.type === 'transfer' ? (
                    <ArrowUpDown className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Flame className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tx.type === 'mint' ? 'Minted' : tx.type === 'transfer' ? 'Transferred' : 'Retired'}{' '}
                    {tx.amount.toLocaleString()} credits
                  </p>
                  <p className="text-xs text-gray-600">{tx.project} • {tx.user}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{tx.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}