'use client';

import { useState } from 'react';

export default function IPFSDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testIPFSConnection = async () => {
    setTesting(true);
    const debug: any = {
      environment: {
        PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY ? '✅ Set' : '❌ Missing',
        PINATA_SECRET_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY ? '✅ Set' : '❌ Missing',
        PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT ? '✅ Set (Preferred)' : '❌ Missing',
        IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || '❌ Missing',
        IPFS_API_URL: process.env.NEXT_PUBLIC_IPFS_API_URL || '❌ Missing',
      },
      status: {
        clientSide: typeof window !== 'undefined' ? '✅ Client-side' : '❌ Server-side',
        timestamp: new Date().toISOString(),
        ipfsMode: process.env.NEXT_PUBLIC_PINATA_JWT ? 'Pinata JWT' : 
                  (process.env.NEXT_PUBLIC_PINATA_API_KEY ? 'Pinata API Keys' : 'Mock/Fallback')
      }
    };

    // Test a small file upload
    try {
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const { uploadFileToIPFS } = await import('@/utils/ipfs');
      const result = await uploadFileToIPFS(testFile);
      
      debug.testUpload = {
        success: result.success,
        cid: result.cid || 'None',
        error: result.error || 'None',
        gateway: result.gateway || 'None',
      };
    } catch (error) {
      debug.testUpload = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    setDebugInfo(debug);
    setTesting(false);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">IPFS Debug Panel</h3>
        <button
          onClick={testIPFSConnection}
          disabled={testing}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test IPFS'}
        </button>
      </div>
      
      {debugInfo && (
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Environment Variables:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(debugInfo.environment).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className={String(value).includes('✅') ? 'text-green-600' : 'text-red-600'}>
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {debugInfo.testUpload && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Test Upload Result:</h4>
              <div className="bg-white rounded border p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span>Success:</span>
                  <span className={debugInfo.testUpload.success ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.testUpload.success ? '✅' : '❌'}
                  </span>
                  <span>CID:</span>
                  <span className="font-mono text-xs">{debugInfo.testUpload.cid}</span>
                  <span>Error:</span>
                  <span className="text-red-600">{debugInfo.testUpload.error}</span>
                  {debugInfo.testUpload.gateway && (
                    <>
                      <span>Gateway:</span>
                      <a 
                        href={debugInfo.testUpload.gateway} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs font-mono"
                      >
                        {debugInfo.testUpload.gateway}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        <p><strong>Note:</strong> If Pinata keys are missing, uploads will use mock IPFS for development.</p>
        <p>To get real IPFS uploads working, sign up at <a href="https://pinata.cloud" target="_blank" className="text-blue-600 hover:underline">pinata.cloud</a> and add your API keys to .env.local</p>
      </div>
    </div>
  );
}