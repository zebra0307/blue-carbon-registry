'use client';

import { SolanaWalletProvider } from '@/components/WalletProvider';
import { Layout } from '@/components/Navigation';
import DashboardContent from '@/components/DashboardContent';

export default function Home() {
  return (
    <SolanaWalletProvider>
      <Layout>
        <DashboardContent />
      </Layout>
    </SolanaWalletProvider>
  );
}