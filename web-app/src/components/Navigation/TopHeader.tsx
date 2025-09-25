'use client';

import React from 'react';
import Image from 'next/image';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface TopHeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function TopHeader({ onMenuClick, sidebarOpen = false }: TopHeaderProps) {
  const { connected, publicKey } = useWallet();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 shadow-lg z-50 h-16 backdrop-blur-sm transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700'
        : 'bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200'
    }`}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6 w-full">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Hamburger Menu Button - Now available on all screen sizes */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              data-sidebar-toggle="true"
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-slate-600 hover:bg-slate-100'
              } ${sidebarOpen ? 'bg-blue-500/20 text-blue-400' : ''}`}
              aria-label="Toggle sidebar"
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
          
          <div className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden backdrop-blur-sm border transition-colors ${
            isDarkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-slate-100 border-slate-200'
          }`}>
            <Image 
              src="/OceanaVerse.png" 
              alt="OceanaVerse Logo" 
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>OceanaVerse</h1>
            <p className={`text-xs sm:text-sm transition-colors ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>Blue Carbon MRV</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`group relative w-8 h-8 rounded-full border transition-all duration-200 flex items-center justify-center backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50' 
                  : 'bg-slate-100/80 border-slate-300/50 hover:bg-slate-200/80'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="relative w-4 h-4">
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
                )}
              </div>
            </button>
          </div>

          <WalletMultiButton 
            style={{ pointerEvents: 'auto' }}
            className="!bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !text-white !px-5 !py-2 !rounded-lg !text-sm !font-semibold !transition-all !duration-200 !shadow-lg hover:!shadow-blue-500/25 !border !border-blue-500/30 !min-h-0 !h-auto !cursor-pointer !pointer-events-auto !relative !z-10" 
          />
        </div>
      </div>
    </header>
  );
}