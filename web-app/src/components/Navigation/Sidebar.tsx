'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  TreePine, 
  Plus, 
  FileText, 
  Coins, 
  ArrowRightLeft, 
  Award, 
  ShoppingCart, 
  TrendingUp,
  PieChart,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'My Projects', href: '/projects', icon: TreePine },
  { name: 'Register Project', href: '/register', icon: Plus },
  { name: 'Upload Documents', href: '/upload', icon: FileText },
  { name: 'Mint Credits', href: '/mint', icon: Coins },
  { name: 'Transfer Credits', href: '/transfer', icon: ArrowRightLeft },
  { name: 'Retire Credits', href: '/retire', icon: Award },
  { name: 'Token Economics', href: '/token-economics', icon: TrendingUp },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isDarkMode } = useTheme();

  return (
    <div className={`fixed top-16 bottom-0 left-0 z-40 w-64 shadow-2xl border-r overflow-y-auto transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-700' 
        : 'bg-white border-slate-200'
    }`}>

      {/* Navigation */}
      <nav className="pt-6 px-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-300 border border-blue-500/30 shadow-lg backdrop-blur-sm'
                      : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-600/50'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-300'
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive 
                        ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        : isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <ChevronRight className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Solana Signature */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t transition-colors ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center space-x-2">
            <svg 
              width="16" 
              height="16" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 200 200"
              className="transition-colors"
            >
              <rect x="50" y="75" width="100" height="50" rx="15" ry="15" fill={isDarkMode ? '#ff7f50' : '#C04000'}/>
              <circle cx="80" cy="70" r="5" fill="#000000"/>
              <circle cx="120" cy="70" r="5" fill="#000000"/>
              <line x1="50" y1="90" x2="30" y2="110" stroke={isDarkMode ? '#ff7f50' : '#C04000'} strokeWidth="5" strokeLinecap="round"/>
              <line x1="50" y1="105" x2="30" y2="125" stroke={isDarkMode ? '#ff7f50' : '#C04000'} strokeWidth="5" strokeLinecap="round"/>
              <line x1="150" y1="90" x2="170" y2="110" stroke={isDarkMode ? '#ff7f50' : '#C04000'} strokeWidth="5" strokeLinecap="round"/>
              <line x1="150" y1="105" x2="170" y2="125" stroke={isDarkMode ? '#ff7f50' : '#C04000'} strokeWidth="5" strokeLinecap="round"/>
              <path d="M 50 80 Q 20 50, 20 80 T 50 110 Z" fill={isDarkMode ? '#ff7f50' : '#C04000'}/>
              <path d="M 150 80 Q 180 50, 180 80 T 150 110 Z" fill={isDarkMode ? '#ff7f50' : '#C04000'}/>
            </svg>
            <span className={`text-xs font-medium transition-colors ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>built on solana</span>
          </div>
          <span className={`text-xs transition-colors ${
            isDarkMode ? 'text-slate-500' : 'text-slate-600'
          }`}>v1.98 • 2025</span>
        </div>
      </div>
    </div>
  );
}