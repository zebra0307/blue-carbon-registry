'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SolanaWalletProvider } from '@/components/WalletProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SolanaWalletProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </SolanaWalletProvider>
    </ThemeProvider>
  );
}