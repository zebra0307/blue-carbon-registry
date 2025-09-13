'use client';

import { SolanaWalletProvider } from '@/components/WalletProvider';
import FunctionalDashboard2 from '@/components/FunctionalDashboard2';

export default function Page() {
  return (
    <SolanaWalletProvider>
      <FunctionalDashboard2 />
    </SolanaWalletProvider>
  );
}