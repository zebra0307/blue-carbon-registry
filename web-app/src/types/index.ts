import { PublicKey } from '@solana/web3.js';

export interface Project {
  projectId: string;
  owner: PublicKey;
  ipfsCid: string;
  creditsIssued: number;
  bump: number;
}

export interface CarbonCredit {
  mint: PublicKey;
  amount: number;
  decimals: number;
}

export interface WalletContextState {
  connected: boolean;
  publicKey: PublicKey | null;
  wallet: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface ProjectFormData {
  projectId: string;
  name: string;
  description: string;
  location: string;
  ipfsCid?: string;
}

export interface TransactionResult {
  signature?: string;
  success: boolean;
  error?: string;
  message?: string;
  creditsIssued?: number;
  mintAddress?: string;
  creditsRetired?: number;
}

export interface CreditMintData {
  projectId: string;
  amount: string;
  verificationDate: string;
  verificationReport: string;
}

export interface CreditTransferData {
  creditId: string;
  recipient: string;
  amount: string;
}

export interface CreditRetireData {
  creditId: string;
  amount: string;
  reason: string;
}
