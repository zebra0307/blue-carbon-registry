'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface NavbarProps {
  onMenuToggle: () => void;
  activeSection: string;
}

export default function Navbar({ onMenuToggle, activeSection }: NavbarProps) {
  const { connected, publicKey } = useWallet();

  const getSectionTitle = (section: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      projects: 'Projects',
      register: 'Register Project',
      mint: 'Mint Credits',
      transfer: 'Transfer Credits',
      retire: 'Retire Credits',
      marketplace: 'Marketplace',
      analytics: 'Analytics',
    };
    return titles[section] || 'Dashboard';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Logo and title for larger screens */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-white rounded-xl flex items-center justify-center shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                <img src="/logo.svg" alt="Blue Carbon Registry" className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Blue Carbon Registry</h1>
                <p className="text-xs text-gray-500 font-medium">Sustainable Carbon Credits</p>
              </div>
            </div>
          </div>

          {/* Right side - Status and wallet */}
          <div className="flex items-center space-x-3">
            {/* Connection status */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
              <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs font-medium text-gray-600">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Network indicator */}
            <div className="hidden md:flex items-center">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium border border-purple-200">
                Devnet
              </span>
            </div>

            {/* Wallet connection */}
            <div className="wallet-adapter-button-wrapper">
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !font-medium !px-4 !py-2 !text-sm !transition-all !duration-200 !shadow-md hover:!shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}