'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function FunctionalHeader({ currentPage, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { connected, publicKey } = useWallet();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '🏗️' },
    { id: 'register', label: 'Register Project', icon: '📝' },
    { id: 'credits', label: 'Credits', icon: '🪙' },
    { id: 'mint', label: 'Mint Credits', icon: '⚡' },
    { id: 'transfer', label: 'Transfer', icon: '📤' },
    { id: 'retire', label: 'Retire', icon: '🔥' },
    { id: 'marketplace', label: 'Marketplace', icon: '🏪' },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🌊</div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                Blue Carbon Registry
              </h1>
              <p className="text-sm text-gray-600">Powered by Solana</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Wallet Connection and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {connected && publicKey && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">
                  {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </span>
              </div>
            )}

            {/* Wallet Button */}
            <div className="wallet-adapter-button-trigger">
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}