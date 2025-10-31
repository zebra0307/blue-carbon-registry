'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { Layout } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserRole } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, Settings, Database, Loader2 } from 'lucide-react';
import { getProgram, getRegistryPda, getProgramId, getCarbonMintPda } from '@/lib/anchor';
import { getErrorMessage, isUserRejection } from '@/lib/errors';

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
  const wallet = useWallet();
  const { connection } = useConnection();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || UserRole.USER);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeValidators: 0,
    totalCreditsMinted: 0,
    creditsRetired: 0,
  });

  // Check if registry is initialized
  useEffect(() => {
    const checkRegistry = async () => {
      if (!wallet.publicKey || !connection) {
        setIsLoading(false);
        return;
      }

      try {
        const program = getProgram(connection, wallet as any);
        const programId = getProgramId();
        const [registryPda] = getRegistryPda(programId);

        const registry = await program.account.globalRegistry.fetch(registryPda);
        
        if (registry) {
          setIsInitialized(true);
          // Update stats from registry (using actual fields from IDL)
          setStats({
            totalProjects: registry.totalProjects?.toNumber() || 0,
            activeValidators: 0, // Not tracked in current registry
            totalCreditsMinted: registry.totalCreditsIssued?.toNumber() || 0,
            creditsRetired: 0, // Not tracked in current registry
          });
        }
      } catch (error: any) {
        console.log('Registry not initialized yet');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.publicKey, connection]);

  const handleInitializeRegistry = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsInitializing(true);
    const toastId = toast.loading('Initializing registry...');

    try {
      const program = getProgram(connection, wallet as any);
      const programId = getProgramId();
      const [registryPda] = getRegistryPda(programId);
      const [carbonTokenMintPda] = getCarbonMintPda(programId);

      // Call initialize_registry instruction with decimals parameter
      const tx = await program.methods
        .initializeRegistry(6) // 6 decimals for carbon credit tokens
        .rpc();

      console.log('Registry initialized. Transaction:', tx);
      
      toast.success('Registry initialized successfully!', { id: toastId });
      setIsInitialized(true);
      
      // Refresh stats
      const registry = await program.account.globalRegistry.fetch(registryPda);
      if (registry) {
        setStats({
          totalProjects: registry.totalProjects?.toNumber() || 0,
          activeValidators: 0,
          totalCreditsMinted: registry.totalCreditsIssued?.toNumber() || 0,
          creditsRetired: 0,
        });
      }
    } catch (error: any) {
      console.error('Failed to initialize registry:', error);
      
      if (isUserRejection(error)) {
        toast.error('Transaction cancelled', { id: toastId });
      } else {
        const errorMsg = getErrorMessage(error);
        toast.error(`Failed to initialize: ${errorMsg}`, { id: toastId });
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const handleRoleChange = () => {
    setUserRole(selectedRole);
    toast.success(`Role updated to ${selectedRole}`);
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

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading registry status...</span>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registry Status Banner */}
          {!isInitialized && (
            <div className="md:col-span-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    <strong>Registry Not Initialized:</strong> The global registry has not been set up yet. Initialize it to start using the system.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isInitialized && (
            <div className="md:col-span-2 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-200">
                    <strong>Registry Active:</strong> The global registry is initialized and operational.
                  </p>
                </div>
              </div>
            </div>
          )}
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
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              onClick={handleInitializeRegistry}
              disabled={isInitializing || isInitialized || !wallet.connected}
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : isInitialized ? (
                'Registry Already Initialized'
              ) : (
                'Initialize Registry'
              )}
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
              <span className="font-semibold text-gray-900 dark:text-white">{stats.totalProjects}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Active Validators</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.activeValidators}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Total Credits Minted</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.totalCreditsMinted}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Credits Retired</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.creditsRetired}</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
