'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function FunctionalHeader() {
  const { connected } = useWallet();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">BC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blue Carbon Registry</h1>
              <p className="text-gray-600">Sustainable Carbon Credits</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Projects
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Credits
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Portfolio
              </a>
            </nav>
            <WalletMultiButton className="!bg-blue-600 !hover:bg-blue-700 !rounded-lg" />
          </div>
        </div>
      </div>
    </header>
  );
}
