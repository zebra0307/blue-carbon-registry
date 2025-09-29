'use client';

import { useState } from 'react';

/**
 * Debug Panel Component
 * A developer tool that can be used to debug the Blue Carbon Registry application
 * Shows connection status, blockchain details, and transaction logs
 */

interface DebugPanelProps {
  enabled?: boolean;
}

export default function DebugPanel({ enabled = false }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<{id: number; message: string; timestamp: string}[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [networkDetails, setNetworkDetails] = useState<{
    name: string;
    endpoint: string;
  } | null>(null);
  
  // Don't render anything if not enabled
  if (!enabled) return null;

  const addLog = (message: string) => {
    const newLog = {
      id: Date.now(),
      message,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const checkConnection = async () => {
    try {
      // This is a placeholder - in real implementation you'd check connection to Solana
      addLog('Checking connection...');
      setIsConnected(true);
      setNetworkDetails({
        name: 'Solana Devnet',
        endpoint: 'https://api.devnet.solana.com',
      });
      addLog('Connected to Solana Devnet');
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      addLog(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Debug Panel Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg"
        title="Toggle Debug Panel"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <circle cx="12" cy="10" r="1"></circle>
        </svg>
      </button>

      {/* Debug Panel Content */}
      {isOpen && (
        <div className="mt-2 w-96 bg-gray-900 bg-opacity-90 text-white p-4 rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Developer Debug Console</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Connection Status */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Blockchain Connection:</span>
              <div className="flex items-center">
                {isConnected === null ? (
                  <span className="text-yellow-400 text-xs">Unknown</span>
                ) : isConnected ? (
                  <span className="text-green-400 text-xs flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span> Connected
                  </span>
                ) : (
                  <span className="text-red-400 text-xs flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span> Disconnected
                  </span>
                )}
                <button
                  onClick={checkConnection}
                  className="ml-2 text-xs bg-blue-700 px-2 py-1 rounded hover:bg-blue-600"
                >
                  Check
                </button>
              </div>
            </div>
            
            {networkDetails && (
              <div className="mt-1 text-xs text-gray-400">
                <div>Network: {networkDetails.name}</div>
                <div className="truncate">Endpoint: {networkDetails.endpoint}</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mb-4">
            <button 
              className="bg-blue-600 hover:bg-blue-500 text-xs px-2 py-1 rounded"
              onClick={() => {
                const walletKey = window.localStorage.getItem('walletPublicKey');
                if (walletKey) {
                  addLog(`Wallet Public Key: ${walletKey}`);
                } else {
                  addLog('No wallet public key found in local storage');
                }
              }}
            >
              Show Wallet
            </button>
            <button 
              className="bg-purple-600 hover:bg-purple-500 text-xs px-2 py-1 rounded"
              onClick={() => {
                localStorage.clear();
                addLog('Local storage cleared');
              }}
            >
              Clear Storage
            </button>
            <button 
              className="bg-red-600 hover:bg-red-500 text-xs px-2 py-1 rounded"
              onClick={() => {
                setLogs([]);
              }}
            >
              Clear Logs
            </button>
          </div>

          {/* Log Output */}
          <div className="border-t border-gray-700 pt-2">
            <div className="text-xs font-semibold mb-1">Debug Logs:</div>
            <div className="bg-gray-950 rounded text-xs p-2 h-40 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">No logs yet. Actions will be recorded here.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="mb-1 border-b border-gray-800 pb-1">
                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="ml-2 text-green-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}