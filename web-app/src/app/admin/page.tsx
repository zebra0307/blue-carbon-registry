'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserRole } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, Settings, Database } from 'lucide-react';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <Layout>
        <AdminDashboard />
      </Layout>
    </ProtectedRoute>
  );
}

function AdminDashboard() {
  const { user, setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || UserRole.USER);

  const handleRoleChange = () => {
    setUserRole(selectedRole);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Shield className="w-8 h-8 mr-3 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          System administration and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current User Role */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Role
            </h2>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Role</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 uppercase">
                {user?.role}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Wallet Address</p>
              <p className="text-xs font-mono text-gray-900 dark:text-white break-all">
                {user?.walletAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Role Assignment */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Role Management
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={UserRole.USER}>User</option>
                <option value={UserRole.VALIDATOR}>Validator</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>
            <button
              onClick={handleRoleChange}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Update Role
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Note: This demo allows self-assignment for testing. Production should use on-chain role management.
            </p>
          </div>
        </div>

        {/* Initialize Registry */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Registry Setup
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Initialize the Blue Carbon Registry on-chain with your wallet as the admin authority.
            </p>
            <button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              onClick={() => alert('Registry initialization will be implemented to call initialize_registry instruction')}
            >
              Initialize Registry
            </button>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ This can only be done once per registry account. Ensure your wallet has sufficient SOL for the transaction.
              </p>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            System Statistics
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Total Projects</span>
              <span className="font-semibold text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Active Validators</span>
              <span className="font-semibold text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Total Credits Minted</span>
              <span className="font-semibold text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Credits Retired</span>
              <span className="font-semibold text-gray-900 dark:text-white">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
