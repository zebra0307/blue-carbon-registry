'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  TreePine, 
  Menu, 
  X, 
  Bell, 
  Settings, 
  User, 
  Search,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface FunctionalHeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  title?: string;
  subtitle?: string;
}

export default function FunctionalHeader({ 
  onMenuToggle, 
  isMobileMenuOpen = false, 
  title = "Blue Carbon Registry",
  subtitle = "Carbon Credit Management Platform"
}: FunctionalHeaderProps) {
  const { connected, publicKey } = useWallet();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 mr-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center">
              <TreePine className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-xs text-gray-500 hidden sm:block">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Center Section - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, credits, or transactions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Section - Actions and Wallet */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Help */}
            <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* User Menu */}
            {connected && (
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">
                    {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'User'}
                  </span>
                </button>
              </div>
            )}

            {/* Wallet Connection */}
            <div className="flex items-center">
              <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-green-600 !border-0 !rounded-lg !px-4 !py-2 !text-sm !font-medium" />
            </div>

            {/* Settings */}
            <button className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Connection Status Bar */}
      <div className={`${connected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border-b px-4 py-2`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className={`text-sm font-medium ${connected ? 'text-green-800' : 'text-yellow-800'}`}>
                {connected ? 'Wallet Connected' : 'Wallet Not Connected'}
              </span>
              {connected && publicKey && (
                <span className="text-xs text-gray-500 hidden sm:inline">
                  Network: Devnet • Balance: Loading...
                </span>
              )}
            </div>
            
            {!connected && (
              <div className="text-xs text-yellow-700">
                Connect your wallet to access full functionality
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}