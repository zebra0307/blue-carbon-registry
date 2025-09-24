'use client';

import React, { useState } from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import { ArrowRightLeft, Send, Wallet, CheckCircle, Copy } from 'lucide-react';
import { useCarbonBalance, useAllProjects } from '@/hooks/useBlockchainData';

function TransferCreditsContent() {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedCredit, setSelectedCredit] = useState('');
  const { balance, loading: balanceLoading } = useCarbonBalance();
  const { projects, loading: projectsLoading } = useAllProjects();

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
      balance: 500,
      price: 28.00,
      vintage: 2024
    }
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'Sent',
      amount: 100,
      recipient: '9WzDX...4Kj2',
      project: 'Sundarbans Mangrove Restoration',
      date: '2024-09-24',
      status: 'Completed'
    },
    {
      id: '2',
      type: 'Received',
      amount: 250,
      sender: 'Bx7vK...8Mw9',
      project: 'Great Barrier Reef Seagrass Conservation',
      date: '2024-09-23',
      status: 'Completed'
    }
  ];

  const handleTransfer = () => {
    // TODO: Integrate with blockchain
    console.log('Transfer credits:', {
      credit: selectedCredit,
      amount: transferAmount,
      recipient: recipientAddress
    });
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <ArrowRightLeft className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transfer Credits</h1>
            <p className="text-gray-600">Send carbon credits to other wallet addresses</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <div className="space-y-6">
          {/* Credit Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Credits to Transfer</h3>
            <div className="space-y-3">
              {mockCreditHoldings.map((credit) => (
                <div
                  key={credit.id}
                  onClick={() => setSelectedCredit(credit.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCredit === credit.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{credit.projectName}</h4>
                    <span className="text-sm text-gray-500">Vintage {credit.vintage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Balance: {credit.balance} credits</span>
                    <span className="font-medium text-green-600">${credit.price}/credit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Details */}
          {selectedCredit && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Wallet Address *
                  </label>
                  <div className="relative">
                    <Wallet className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="recipient"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Solana wallet address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Transfer *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Number of credits"
                    min="1"
                    max={mockCreditHoldings.find(c => c.id === selectedCredit)?.balance}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Max available: {mockCreditHoldings.find(c => c.id === selectedCredit)?.balance} credits
                  </p>
                </div>

                {/* Transfer Preview */}
                {transferAmount && recipientAddress && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Transfer Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Credits to Transfer:</span>
                        <span className="font-medium text-blue-900">{parseInt(transferAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Estimated Value:</span>
                        <span className="font-medium text-blue-900">
                          ${(parseInt(transferAmount) * (mockCreditHoldings.find(c => c.id === selectedCredit)?.price || 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Network Fee:</span>
                        <span className="font-medium text-blue-900">~0.000005 SOL</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setSelectedCredit('');
                      setTransferAmount('');
                      setRecipientAddress('');
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={!transferAmount || !recipientAddress || parseInt(transferAmount) <= 0}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Credits</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tx.type === 'Sent' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {tx.type}
                    </span>
                    <span className="font-medium">{tx.amount} credits</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                
                <p className="text-sm text-gray-600 mb-1">{tx.project}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {tx.type === 'Sent' ? 'To:' : 'From:'} {tx.type === 'Sent' ? tx.recipient : tx.sender}
                    </span>
                    <button
                      onClick={() => copyAddress(tx.type === 'Sent' ? tx.recipient! : tx.sender!)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">{tx.date}</span>
                </div>
              </div>
            ))}
          </div>

          {recentTransactions.length === 0 && (
            <div className="text-center py-8">
              <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Transfer Guidelines</h4>
            <ul className="text-sm text-yellow-800 mt-1 space-y-1">
              <li>• Ensure the recipient address is correct - transactions cannot be reversed</li>
              <li>• Credits are transferred as SPL tokens on Solana blockchain</li>
              <li>• Network fees are paid in SOL from your wallet</li>
              <li>• All transfers are recorded permanently on-chain</li>
              <li>• Recipient must have a Solana wallet to receive credits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransferCreditsPage() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <TransferCreditsContent />
      </Layout>
    </SolanaWalletProvider>
  );
}