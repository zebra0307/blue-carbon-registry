'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  const { connected, publicKey } = useWallet();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-ocean-blue-500 to-carbon-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BC</span>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Blue Carbon Registry
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/projects"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Projects
            </a>
            <a
              href="/credits"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Credits
            </a>
            <a
              href="/marketplace"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Marketplace
            </a>
          </nav>

          {/* Wallet connection */}
          <div className="flex items-center space-x-4">
            {connected && publicKey && (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
              </div>
            )}
            <WalletMultiButton className="!bg-ocean-blue-600 hover:!bg-ocean-blue-700 !rounded-lg !h-10 !px-4 !text-sm !font-medium transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
