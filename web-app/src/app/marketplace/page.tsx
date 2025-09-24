'use client';

import React from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { ShoppingCart, TrendingUp, MapPin, Award } from 'lucide-react';
import { useAllProjects } from '@/hooks/useBlockchainData';

function MarketplaceContent() {
  const { projects, loading, error } = useAllProjects();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const marketplaceListings = projects.length > 0 ? projects.map(project => ({
    id: project.id,
    projectName: project.name,
    location: project.location,
    credits: project.creditsAvailable,
    price: project.price,
    vintage: project.vintage,
    seller: project.developer,
    status: 'Available'
  })) : [
    {
      id: '1',
      projectName: 'Sundarbans Mangrove Restoration',
      location: 'Bangladesh',
      credits: 5000,
      price: 25.50,
      vintage: 2024,
      seller: 'Blue Carbon Solutions Ltd.',
      status: 'Available'
    },
    {
      id: '2',
      projectName: 'Great Barrier Reef Seagrass Conservation',
      location: 'Australia',
      credits: 2500,
      price: 32.75,
      vintage: 2023,
      seller: 'Marine Conservation Australia',
      status: 'Available'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600">Buy and sell verified carbon credits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceListings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-green-100 to-blue-100"></div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{listing.projectName}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {listing.location}
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Vintage {listing.vintage}
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-lg font-bold text-green-600">${listing.price}</p>
                  <p className="text-xs text-gray-500">per credit</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{listing.credits.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">credits available</p>
                </div>
              </div>
              <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Purchase Credits
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <MarketplaceContent />
      </Layout>
    </SolanaWalletProvider>
  );
}