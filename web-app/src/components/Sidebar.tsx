'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', requiresWallet: false },
  { id: 'projects', label: 'Projects', icon: '🏗️', requiresWallet: false },
  { id: 'register', label: 'Register Project', icon: '➕', requiresWallet: true },
  { id: 'mint', label: 'Mint Credits', icon: '🪙', requiresWallet: true },
  { id: 'transfer', label: 'Transfer Credits', icon: '📤', requiresWallet: true },
  { id: 'retire', label: 'Retire Credits', icon: '🔥', requiresWallet: true },
  { id: 'marketplace', label: 'Marketplace', icon: '🏪', requiresWallet: false },
  { id: 'analytics', label: 'Analytics', icon: '📈', requiresWallet: false },
];

export default function Sidebar({ isOpen, onClose, activeSection, onSectionChange }: SidebarProps) {
  const { connected } = useWallet();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-xl border-r border-gray-200 z-30
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-white rounded-lg flex items-center justify-center border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300">
              <img src="/logo.svg" alt="Blue Carbon Registry" className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Blue Carbon</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                console.log('Navigation clicked:', item.id, 'Requires wallet:', item.requiresWallet, 'Connected:', connected);
                if (!item.requiresWallet || connected) {
                  onSectionChange(item.id);
                  onClose(); // Close sidebar on mobile after selection
                }
              }}
              disabled={item.requiresWallet && !connected}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${
                item.requiresWallet && !connected
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:text-gray-900 cursor-pointer'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.requiresWallet && !connected && (
                <span className="ml-auto text-xs text-gray-400">🔒</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Powered by Solana</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}