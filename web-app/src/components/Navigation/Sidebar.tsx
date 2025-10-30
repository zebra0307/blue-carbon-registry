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
  ChevronRight,
  CheckSquare,
  Activity,
  MapPin,
  Shield
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'My Projects', href: '/projects', icon: TreePine },
  { name: 'Register Project', href: '/register', icon: Plus },
  { name: 'Verification', href: '/verification', icon: CheckSquare },
  { name: 'Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Field Data', href: '/field-data', icon: MapPin },
  { name: 'Mint Credits', href: '/mint', icon: Coins },
  { name: 'Transfer Credits', href: '/transfer', icon: ArrowRightLeft },
  { name: 'Retire Credits', href: '/retire', icon: Award },
  { name: 'Token Economics', href: '/token-economics', icon: TrendingUp },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
  { name: 'Admin', href: '/admin', icon: Shield },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ isOpen = true, onClose }, ref) => {
    const pathname = usePathname();
    const { isDarkMode } = useTheme();

    return (
      <div
        ref={ref}
        className={`
          fixed top-16 bottom-0 left-0 z-40 w-56 shadow-2xl border-r overflow-y-auto 
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDarkMode 
            ? 'bg-slate-900 border-slate-700' 
            : 'bg-white border-slate-200'
          }
        `}
      >

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
    </div>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;