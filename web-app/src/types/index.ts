import { PublicKey } from '@solana/web3.js';

export type VerificationStatus = 'pending' | 'under_review' | 'field_verification' | 'scientific_review' | 'approved' | 'rejected';

export interface VerificationData {
  status: VerificationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
  requiredDocuments: string[];
  submittedDocuments: string[];
  fieldVerificationDate?: Date;
  scientificReviewDate?: Date;
}

export interface Project {
  projectId: string;
  name: string;
  location: string;
  area: number;
  carbonStored: number;
  creditsIssued: number;
  owner: PublicKey;
  bump: number;
  ipfsCid: string;
  verification: VerificationData;
  canMintCredits: boolean;
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
  coordinates: {
    latitude: number;
    longitude: number;
  };
  area: number;
  projectType: 'mangrove' | 'seagrass' | 'salt_marsh' | 'kelp_forest';
  baselineData: {
    carbonMeasurement: number;
    measurementDate: Date;
    measurementMethod: string;
  };
  landRights: 'owned' | 'permitted' | 'government_approved';
  legalDocuments: File[];
  photos: File[];
  restorationPlan: string;
  monitoringPlan: string;
  expectedSequestration: number;
  timeframe: number; // in years
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
