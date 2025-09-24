'use client';

import React from 'react';
import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <AnalyticsDashboard />
      </Layout>
    </SolanaWalletProvider>
  );
}