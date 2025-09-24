'use client';

import React, { useState } from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { Award, Trash2, FileText } from 'lucide-react';
import { useCarbonBalance } from '@/hooks/useBlockchainData';

function RetireCreditsContent() {
  const [selectedCredit, setSelectedCredit] = useState('');
  const [retireAmount, setRetireAmount] = useState('');
  const [reason, setReason] = useState('');
  const { balance, loading } = useCarbonBalance();

  const mockCreditHoldings = [
    {
      id: '1',
      projectName: 'Sundarbans Mangrove Restoration',
      balance: balance || 1250,
      price: 25.50,
      vintage: 2024
    },
    {
      id: '2',
      projectName: 'Great Barrier Reef Seagrass Conservation',
      balance: 800,
      price: 32.75,
      vintage: 2023
    }
  ];

  const retiredCredits = [
    {
      id: '1',
      project: 'Sundarbans Mangrove Restoration',
      amount: 500,
      date: '2024-09-20',
      reason: 'Corporate carbon offset commitment'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Award className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Retire Credits</h1>
            <p className="text-gray-600">Permanently retire carbon credits to claim environmental benefits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Credits to Retire</h3>
            <div className="space-y-3">
              {mockCreditHoldings.map((credit) => (
                <div
                  key={credit.id}
                  onClick={() => setSelectedCredit(credit.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCredit === credit.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{credit.projectName}</h4>
                  <p className="text-sm text-gray-600">Balance: {credit.balance} credits</p>
                </div>
              ))}
            </div>
          </div>

          {selectedCredit && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Retirement Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Retire *
                  </label>
                  <input
                    type="number"
                    value={retireAmount}
                    onChange={(e) => setRetireAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Number of credits"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retirement Reason
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Why are you retiring these credits?"
                  />
                </div>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Trash2 className="h-4 w-4" />
                  <span>Retire Credits</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Retirement History</h3>
          <div className="space-y-4">
            {retiredCredits.map((retirement) => (
              <div key={retirement.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{retirement.amount} credits</span>
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">{retirement.project}</p>
                <p className="text-xs text-gray-500 mt-1">{retirement.reason}</p>
                <p className="text-xs text-gray-500">{retirement.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RetireCreditsPage() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <RetireCreditsContent />
      </Layout>
    </SolanaWalletProvider>
  );
}