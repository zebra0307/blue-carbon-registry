'use client';

import React from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { FileText } from 'lucide-react';
import OffsetHistory from '@/components/OffsetHistory';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

function OffsetHistoryContent() {
  const { connection } = useConnection();
  
  // Mock program for now - this would come from your Solana setup
  const mockProgram = {} as any;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Carbon Offset History</h1>
            <p className="text-gray-600">
              View your complete history of retired carbon credits and environmental impact
            </p>
          </div>
        </div>
      </div>

      <OffsetHistory program={mockProgram} connection={connection} />

      {/* Educational Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-6 h-6 mr-2">📊</div>
            Offset Tracking
          </h3>
          <p className="text-gray-600 text-sm">
            Every retired credit creates a permanent, immutable record on the Solana blockchain. 
            This ensures transparency and prevents double counting of offset benefits.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-6 h-6 mr-2">🌍</div>
            Environmental Impact
          </h3>
          <p className="text-gray-600 text-sm">
            Each retired carbon credit represents 1 tonne of CO₂ equivalent removed from the atmosphere 
            through blue carbon ecosystem protection and restoration.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-6 h-6 mr-2">🔗</div>
            Blockchain Verification
          </h3>
          <p className="text-gray-600 text-sm">
            All offset claims are verifiable on the Solana blockchain explorer. 
            Share your offset history with stakeholders for carbon accounting and reporting.
          </p>
        </div>
      </div>

      {/* Download Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Reporting</h3>
        <p className="text-gray-600 mb-4">
          Generate reports and certificates for your carbon offset activities:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FileText className="h-4 w-4" />
            <span>Download CSV</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <FileText className="h-4 w-4" />
            <span>Generate Certificate</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <FileText className="h-4 w-4" />
            <span>Annual Report</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <FileText className="h-4 w-4" />
            <span>Share Impact</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OffsetHistoryPage() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <OffsetHistoryContent />
      </Layout>
    </SolanaWalletProvider>
  );
}