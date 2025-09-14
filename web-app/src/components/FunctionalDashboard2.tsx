'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Header from './Header';

interface Stats {
  totalProjects: number;
  creditsIssued: number;
  creditsTransferred: number;
  creditsRetired: number;
}

export default function FunctionalDashboard2() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [stats, setStats] = useState<Stats>({
    totalProjects: 15,
    creditsIssued: 25430,
    creditsTransferred: 12450,
    creditsRetired: 8320
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 bg-blue-600 p-6 rounded-lg">
            Welcome to Blue Carbon Registry
          </h1>
          <p className="text-blue-100 mb-6 bg-blue-600 p-4 rounded-lg">
            Manage carbon credits from blue carbon ecosystems on the Solana blockchain.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
            <div className="text-gray-600">Total Projects</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-green-600">{stats.creditsIssued.toLocaleString()}</div>
            <div className="text-gray-600">Credits Issued</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-blue-600">{stats.creditsTransferred.toLocaleString()}</div>
            <div className="text-gray-600">Credits Transferred</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-purple-600">{stats.creditsRetired.toLocaleString()}</div>
            <div className="text-gray-600">Credits Retired</div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
          {connected ? (
            <div className="text-green-600">
              Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
            </div>
          ) : (
            <div className="text-gray-500">
              Please connect your wallet to interact with the registry
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
