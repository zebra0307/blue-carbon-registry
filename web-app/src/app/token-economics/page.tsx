'use client';

import React from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { TrendingUp, DollarSign, BarChart3, PieChart } from 'lucide-react';
import { useTokenEconomics } from '@/hooks/useBlockchainData';

function TokenEconomicsContent() {
  const { economics, loading } = useTokenEconomics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const economicsData = [
    {
      title: 'Total Supply',
      value: economics?.totalSupply?.toLocaleString() || '1,000,000',
      unit: 'BCR Tokens',
      change: 'Fixed Supply',
      icon: PieChart
    },
    {
      title: 'Circulating Supply',
      value: economics?.circulatingSupply?.toLocaleString() || '750,000',
      unit: 'BCR Tokens',
      change: '+2.5% this month',
      icon: TrendingUp
    },
    {
      title: 'Market Cap',
      value: '$15.2M',
      unit: 'USD',
      change: '+8.2% this week',
      icon: DollarSign
    },
    {
      title: 'Trading Volume',
      value: '$2.8M',
      unit: '24h Volume',
      change: '+15.7% today',
      icon: BarChart3
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Token Economics</h1>
            <p className="text-gray-600">Blue Carbon Registry token metrics and analytics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {economicsData.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <metric.icon className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">{metric.change}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-xs text-gray-500">{metric.unit}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Project Rewards</span>
              <span className="font-bold">40%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Community Pool</span>
              <span className="font-bold">25%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Team & Advisors</span>
              <span className="font-bold">20%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Public Sale</span>
              <span className="font-bold">15%</span>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
            <p className="text-gray-500">Token Distribution Chart</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TokenEconomicsPage() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <TokenEconomicsContent />
      </Layout>
    </SolanaWalletProvider>
  );
}