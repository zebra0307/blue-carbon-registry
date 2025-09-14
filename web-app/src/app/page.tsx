'use client';

import { SolanaWalletProvider } from '@/components/WalletProvider';
import Dashboard from './page-complex';

export default function Page() {
  return (
    <SolanaWalletProvider>
      <Dashboard />
    </SolanaWalletProvider>
  );
}