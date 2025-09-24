'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function BlockchainDebugger() {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    balance?: number;
    blockHeight?: number;
    endpoint?: string;
    error?: string;
  }>({
    isConnected: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      checkConnection();
    }
  }, [connected, publicKey]);

  const checkConnection = async () => {
    setLoading(true);
    try {
      // Check connection health
      const blockHeight = await connection.getBlockHeight();
      
      // Get wallet balance
      const balance = await connection.getBalance(publicKey!);
      
      setConnectionStatus({
        isConnected: true,
        balance: balance / LAMPORTS_PER_SOL,
        blockHeight,
        endpoint: connection.rpcEndpoint,
      });
    } catch (error) {
      console.error('Blockchain connection error:', error);
      setConnectionStatus({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: connection.rpcEndpoint,
      });
    } finally {
      setLoading(false);
    }
  };

  const testTransaction = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Try to get recent blockhash to test RPC connectivity
      const { blockhash } = await connection.getLatestBlockhash();
      alert(`✅ RPC Connection Working!\nLatest Blockhash: ${blockhash.slice(0, 8)}...`);
    } catch (error) {
      console.error('RPC test failed:', error);
      alert(`❌ RPC Connection Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!connected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
        <h3 className="font-medium text-yellow-800 mb-2">🔍 Blockchain Debugger</h3>
        <p className="text-sm text-yellow-700">Connect your wallet to test blockchain connectivity</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 m-4 space-y-4">
      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
        🔍 Blockchain Connection Debugger
        {loading && <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
      </h3>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Wallet Info</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Wallet:</span>
              <span className="font-mono text-xs">{wallet?.adapter?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span>Address:</span>
              <span className="font-mono text-xs">
                {publicKey ? `${publicKey.toString().slice(0, 8)}...` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Network Info</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>RPC Status:</span>
              <span className={`font-medium ${connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus.isConnected ? '✅ Online' : '❌ Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Endpoint:</span>
              <span className="font-mono text-xs max-w-xs truncate">
                {connectionStatus.endpoint}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Block Height:</span>
              <span className="font-medium">
                {connectionStatus.blockHeight || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Balance:</span>
              <span className="font-medium">
                {connectionStatus.balance !== undefined ? `${connectionStatus.balance.toFixed(4)} SOL` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {connectionStatus.error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <h4 className="font-medium text-red-800 mb-1">Connection Error</h4>
          <p className="text-sm text-red-700">{connectionStatus.error}</p>
        </div>
      )}

      {/* Test Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={checkConnection}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={testTransaction}
          disabled={loading || !connectionStatus.isConnected}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          Test RPC
        </button>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <h4 className="font-medium text-blue-800 mb-2">💡 Troubleshooting Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Ensure you have SOL in your wallet for transactions</li>
          <li>Try switching to a different RPC endpoint if connection fails</li>
          <li>Check if your wallet is connected to the correct network (Devnet)</li>
          <li>Refresh the page if wallet connection seems stuck</li>
          <li>Make sure your wallet extension is updated</li>
        </ul>
      </div>

      {/* Network Switch Helper */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <h4 className="font-medium text-gray-800 mb-2">🌐 Network Configuration</h4>
        <p className="text-sm text-gray-600 mb-2">
          This app is configured for <strong>Solana Devnet</strong>. Make sure your wallet is set to the same network.
        </p>
        <div className="text-xs text-gray-500">
          <p>Current RPC: {connectionStatus.endpoint}</p>
          <p>Expected Network: Devnet</p>
        </div>
      </div>
    </div>
  );
}