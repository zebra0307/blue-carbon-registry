'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AlertTriangle, CheckCircle, Settings, Loader2 } from 'lucide-react';
import { ensureRegistryExists, withRegistryCheck } from '@/utils/registryManager';
import { initializeRegistry } from '@/utils/solana';

export default function RegistryStatusBanner() {
  const wallet = useWallet();
  const [registryStatus, setRegistryStatus] = useState<'checking' | 'exists' | 'missing' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    checkRegistryStatus();
  }, [wallet.connected]);

  const checkRegistryStatus = async () => {
    if (!wallet.connected) {
      setRegistryStatus('checking');
      return;
    }

    setRegistryStatus('checking');
    try {
      const result = await ensureRegistryExists(wallet);
      if (result.exists) {
        setRegistryStatus('exists');
        setError(null);
      } else {
        setRegistryStatus('missing');
        setError(result.error || 'Registry not found');
      }
    } catch (err: any) {
      setRegistryStatus('error');
      setError(err.message);
    }
  };

  const handleInitializeRegistry = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    setInitializing(true);
    try {
      const result = await initializeRegistry(wallet);
      if (result.success) {
        alert('Registry initialized successfully!');
        setRegistryStatus('exists');
        setError(null);
      } else {
        throw new Error(result.error || 'Initialization failed');
      }
    } catch (error: any) {
      console.error('Registry initialization error:', error);
      alert(`Initialization failed: ${error.message}`);
    } finally {
      setInitializing(false);
    }
  };

  // Don't show anything if wallet not connected or registry exists
  if (!wallet.connected || registryStatus === 'exists') {
    return null;
  }

  // Don't show while checking
  if (registryStatus === 'checking') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
          <p className="text-blue-800 text-sm">Checking registry status...</p>
        </div>
      </div>
    );
  }

  // Show error or missing registry
  if (registryStatus === 'missing' || registryStatus === 'error') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-yellow-800 font-medium">Registry Setup Required</h4>
              <p className="text-yellow-700 text-sm mt-1">
                The Blue Carbon Registry needs to be initialized before you can register projects or view blockchain data.
              </p>
              {error && (
                <p className="text-yellow-600 text-xs mt-1">Error: {error}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleInitializeRegistry}
            disabled={initializing}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initializing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" />
                <span>Initialize Registry</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
}