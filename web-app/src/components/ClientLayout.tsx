'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SolanaWalletProvider } from '@/components/WalletProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SolanaWalletProvider>
        {children}
      </SolanaWalletProvider>
    </ThemeProvider>
  );
}