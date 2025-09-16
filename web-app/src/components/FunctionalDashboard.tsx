'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { fetchUserProjects } from '@/utils/projectService';
import FunctionalHeader from './FunctionalHeader';

interface Stats {
  totalProjects: number;
  creditsIssued: number;
  creditsTransferred: number;
  creditsRetired: number;
}

export default function FunctionalDashboard() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    creditsIssued: 0,
    creditsTransferred: 0,
    creditsRetired: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch real data from blockchain
  useEffect(() => {
    const fetchStats = async () => {
      if (!connected || !publicKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const wallet = { publicKey, connected };
        const projects = await fetchUserProjects(publicKey, wallet);
        
        if (projects.success && projects.projects) {
          // Calculate real stats from blockchain data
          const totalProjects = projects.projects.length;
          let creditsIssued = 0;
          let creditsTransferred = 0;
          let creditsRetired = 0;

          projects.projects.forEach((project: any) => {
            // Sum up credits from each project
            creditsIssued += project.carbonCredits || 0;
            // Note: Transfer and retirement data would come from transaction history
            // For now, we'll show 0 until transaction tracking is implemented
          });

          setStats({
            totalProjects,
            creditsIssued,
            creditsTransferred: 0, // To be implemented with transaction history
            creditsRetired: 0      // To be implemented with transaction history
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [connected, publicKey]);

  return (
    <div className="min-h-screen bg-gray-50">
      <FunctionalHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to Blue Carbon Registry
          </h1>
          <p className="text-blue-100 mb-6">
            Manage carbon credits from blue carbon ecosystems on the Solana blockchain.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '...' : stats.totalProjects}
            </div>
            <div className="text-gray-600">Total Projects</div>
            {!connected && (
              <div className="text-xs text-gray-400 mt-1">Connect wallet to view</div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : stats.creditsIssued.toLocaleString()}
            </div>
            <div className="text-gray-600">Credits Issued</div>
            {!connected && (
              <div className="text-xs text-gray-400 mt-1">Connect wallet to view</div>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">
              {loading ? '...' : stats.creditsTransferred.toLocaleString()}
            </div>
            <div className="text-gray-600">Credits Transferred</div>
            <div className="text-xs text-gray-400 mt-1">Coming soon</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-purple-600">
              {loading ? '...' : stats.creditsRetired.toLocaleString()}
            </div>
            <div className="text-gray-600">Credits Retired</div>
            <div className="text-xs text-gray-400 mt-1">Coming soon</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">Register Project</h3>
            <p className="text-gray-600 mb-4">Register a new blue carbon project</p>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Register Now
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">Mint Credits</h3>
            <p className="text-gray-600 mb-4">Mint new carbon credits for verified projects</p>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Mint Credits
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">View Portfolio</h3>
            <p className="text-gray-600 mb-4">View your carbon credit portfolio</p>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              View Portfolio
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
          {connected ? (
            <div className="flex items-center text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              Please connect your wallet to interact with the registry
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
