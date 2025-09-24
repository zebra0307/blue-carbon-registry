'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  TreePine, 
  Building2, 
  Coins, 
  Users, 
  BarChart3, 
  Settings,
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Eye
} from 'lucide-react';

// Role-based access control
type UserRole = 'project-developer' | 'validator' | 'registry-admin' | 'investor' | 'guest';

interface UserProfile {
  address: string;
  role: UserRole;
  name: string;
  organization?: string;
  verified: boolean;
}

// Mock user data - in real app, this would come from blockchain/API
const getUserRole = (address: string): UserProfile => {
  // Mock role assignment based on wallet address
  const roles: Record<string, UserProfile> = {
    'default': {
      address,
      role: 'project-developer',
      name: 'Project Developer',
      organization: 'Blue Carbon Initiative',
      verified: true
    }
  };
  
  return roles['default'] || {
    address,
    role: 'guest',
    name: 'Guest User',
    verified: false
  };
};

export default function MRVDashboardRouter() {
  const { connected, publicKey } = useWallet();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      const profile = getUserRole(publicKey.toString());
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }
  }, [connected, publicKey]);

  // Role-based navigation items
  const getNavigationItems = (role: UserRole) => {
    const baseItems = [
      { id: 'overview', label: 'Overview', icon: BarChart3, roles: ['project-developer', 'validator', 'registry-admin', 'investor'] },
    ];

    const roleItems = {
      'project-developer': [
        { id: 'projects', label: 'My Projects', icon: Building2 },
        { id: 'register', label: 'Register Project', icon: FileText },
        { id: 'credits', label: 'Credit Management', icon: Coins },
        { id: 'monitoring', label: 'MRV Monitoring', icon: Eye },
      ],
      'validator': [
        { id: 'validation', label: 'Validation Queue', icon: CheckCircle },
        { id: 'verified-projects', label: 'Verified Projects', icon: Shield },
        { id: 'reports', label: 'Validation Reports', icon: FileText },
      ],
      'registry-admin': [
        { id: 'admin-projects', label: 'All Projects', icon: Building2 },
        { id: 'user-management', label: 'User Management', icon: Users },
        { id: 'system-settings', label: 'System Settings', icon: Settings },
        { id: 'analytics', label: 'Registry Analytics', icon: BarChart3 },
      ],
      'investor': [
        { id: 'marketplace', label: 'Credit Marketplace', icon: Coins },
        { id: 'portfolio', label: 'My Portfolio', icon: BarChart3 },
        { id: 'projects-view', label: 'Browse Projects', icon: Building2 },
      ],
      'guest': []
    };

    return [...baseItems.filter(item => !item.roles || item.roles.includes(role)), ...roleItems[role]];
  };

  const renderWalletConnection = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <TreePine className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blue Carbon Registry</h1>
          <p className="text-gray-600 mb-6">MRV Dashboard - Please connect your wallet to continue</p>
          
          <div className="space-y-4">
            <WalletMultiButton className="!w-full" />
            
            <div className="text-sm text-gray-500 space-y-2">
              <p>Supported roles:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 p-2 rounded">Project Developer</div>
                <div className="bg-green-50 p-2 rounded">Validator</div>
                <div className="bg-purple-50 p-2 rounded">Registry Admin</div>
                <div className="bg-yellow-50 p-2 rounded">Investor</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoleBasedContent = () => {
    if (!userProfile) return null;

    switch (activeModule) {
      case 'overview':
        return <OverviewModule userProfile={userProfile} />;
      case 'projects':
        return <ProjectsModule userProfile={userProfile} />;
      case 'validation':
        return <ValidationModule userProfile={userProfile} />;
      case 'admin-projects':
        return <AdminProjectsModule userProfile={userProfile} />;
      case 'marketplace':
        return <MarketplaceModule userProfile={userProfile} />;
      default:
        return <ComingSoonModule module={activeModule} />;
    }
  };

  if (!connected) {
    return renderWalletConnection();
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const navigationItems = getNavigationItems(userProfile.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TreePine className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MRV Dashboard</h1>
                <p className="text-xs text-gray-500">{userProfile.role.replace('-', ' ').toUpperCase()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">{userProfile.name}</span>
                {userProfile.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveModule(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeModule === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Role Info Card */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Role Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{userProfile.role.replace('-', ' ')}</span>
                </div>
                {userProfile.organization && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Organization:</span>
                    <span className="font-medium text-xs">{userProfile.organization}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${userProfile.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {userProfile.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderRoleBasedContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Module Components
function OverviewModule({ userProfile }: { userProfile: UserProfile }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome, {userProfile.name}</h2>
        <p className="text-gray-600">Role: {userProfile.role.replace('-', ' ').toUpperCase()}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Building2 className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="font-semibold text-gray-900">Projects</h3>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Coins className="w-8 h-8 text-green-500 mb-2" />
          <h3 className="font-semibold text-gray-900">Credits</h3>
          <p className="text-2xl font-bold text-gray-900">1,250</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <CheckCircle className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="font-semibold text-gray-900">Verified</h3>
          <p className="text-2xl font-bold text-gray-900">8</p>
        </div>
      </div>
    </div>
  );
}

function ProjectsModule({ userProfile }: { userProfile: UserProfile }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Register New Project
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Project management interface for {userProfile.role}</p>
      </div>
    </div>
  );
}

function ValidationModule({ userProfile }: { userProfile: UserProfile }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Validation Queue</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Validation interface for validators</p>
      </div>
    </div>
  );
}

function AdminProjectsModule({ userProfile }: { userProfile: UserProfile }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Registry Administration</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Administrative interface for registry admins</p>
      </div>
    </div>
  );
}

function MarketplaceModule({ userProfile }: { userProfile: UserProfile }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Credit Marketplace</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Marketplace interface for investors</p>
      </div>
    </div>
  );
}

function ComingSoonModule({ module }: { module: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600">The {module} module is under development</p>
      </div>
    </div>
  );
}