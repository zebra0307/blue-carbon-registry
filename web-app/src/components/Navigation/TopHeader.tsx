'use client';

import React from 'react';
import Image from 'next/image';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function TopHeader() {
  const { connected, publicKey } = useWallet();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 shadow-lg z-50 h-16 backdrop-blur-sm transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700'
        : 'bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200'
    }`}>
      <div className="flex items-center justify-between h-full px-6 w-full">
        <div className="flex items-center space-x-4">
          <div className={`relative w-10 h-10 rounded-lg overflow-hidden backdrop-blur-sm border transition-colors ${
            isDarkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-slate-100 border-slate-200'
          }`}>
            <Image 
              src="/bluecarbon3.png" 
              alt="Blue Carbon Logo" 
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight transition-colors ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>Blue Carbon MRV</h1>
            <p className={`text-sm transition-colors ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>Sustainable Carbon Credits</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
              Devnet
            </span>
            
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
            
            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
              Connected
            </span>
          </div>

          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25 border border-blue-500/30">
            CC1E.ThpK
          </button>
        </div>
      </div>
    </header>
  );
}