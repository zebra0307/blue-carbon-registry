/**
 * Blockchain Integration Service
 * Provides higher-level functions for interacting with the Solana program
 */

import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import BN from 'bn.js';

import {
  getProgram,
  getRegistryPda,
  getProjectPda,
  getVerificationNodePda,
  getMonitoringDataPda,
  getCarbonMintPda,
  getProgramId,
} from './anchor';
import { getErrorMessage, isUserRejection } from './errors';

/**
 * Initialize the global registry
 */
export async function initializeRegistry(
  connection: Connection,
  wallet: WalletContextState,
  decimals: number = 6
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    const program = getProgram(connection, wallet as any);
    const programId = getProgramId();

    const tx = await program.methods
      .initializeRegistry(decimals)
      .accounts({
        admin: wallet.publicKey,
      })
      .rpc();

    return { success: true, signature: tx };
  } catch (error: any) {
    console.error('Initialize registry error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Register a new project
 */
export async function registerProject(
  connection: Connection,
  wallet: WalletContextState,
  params: {
    projectId: string;
    ipfsCid: string;
    carbonTonsEstimated: number;
  }
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    const program = getProgram(connection, wallet as any);
    const programId = getProgramId();

    const carbonBN = new BN(params.carbonTonsEstimated);

    const tx = await program.methods
      .registerProject(params.projectId, params.ipfsCid, carbonBN)
      .accounts({
        projectOwner: wallet.publicKey,
      })
      .rpc();

    return { success: true, signature: tx };
  } catch (error: any) {
    console.error('Register project error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Verify a project
 */
export async function verifyProject(
  connection: Connection,
  wallet: WalletContextState,
  params: {
    projectId: string;
    projectOwner: PublicKey;
    verifiedCarbonTons: number;
  }
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    const program = getProgram(connection, wallet as any);
    const programId = getProgramId();
    const [projectPda] = getProjectPda(params.projectId, params.projectOwner, programId);

    const carbonBN = new BN(params.verifiedCarbonTons);

    const tx = await program.methods
      .verifyProject(carbonBN)
      .accounts({
        admin: wallet.publicKey,
        projectOwner: projectPda, // This should be derived from project account
      })
      .rpc();

    return { success: true, signature: tx };
  } catch (error: any) {
    console.error('Verify project error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Submit monitoring data
 */
export async function submitMonitoringData(
  connection: Connection,
  wallet: WalletContextState,
  params: {
    projectId: string;
    projectOwner: PublicKey;
    data: {
      biomassDensity: number;
      canopyCover: number;
      co2Sequestration: number;
      documentCids: string[];
    };
  }
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    const program = getProgram(connection, wallet as any);
    const programId = getProgramId();
    const [projectPda] = getProjectPda(params.projectId, params.projectOwner, programId);
    const timestamp = Math.floor(Date.now() / 1000);
    const [monitoringDataPda] = getMonitoringDataPda(projectPda, timestamp, programId);

    // Note: This is a simplified version. Actual implementation depends on your program's structure
    // You may need to adjust the method call and accounts based on your program

    return { success: false, error: 'Monitoring data submission not yet implemented in program' };
  } catch (error: any) {
    console.error('Submit monitoring data error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Mint carbon credits
 */
export async function mintCarbonCredits(
  connection: Connection,
  wallet: WalletContextState,
  params: {
    projectId: string;
    projectOwner: PublicKey;
    amount: number;
  }
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    const program = getProgram(connection, wallet as any);
    const programId = getProgramId();
    const [registryPda] = getRegistryPda(programId);
    const [projectPda] = getProjectPda(params.projectId, params.projectOwner, programId);
    const [carbonTokenMintPda] = getCarbonMintPda(programId);

    const amountBN = new BN(params.amount);

    // Note: Actual implementation depends on your program structure
    // This is a placeholder
    return { success: false, error: 'Mint credits functionality needs proper account setup' };
  } catch (error: any) {
    console.error('Mint credits error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Fetch registry data
 */
export async function fetchRegistryData(
  connection: Connection,
  wallet: WalletContextState
): Promise<{
  success: boolean;
  data?: {
    totalProjects: number;
    totalCreditsIssued: number;
    admin: string;
    carbonTokenMint: string;
  };
  error?: string;
}> {
  try {
    const program = getProgram(connection, wallet as any);
    const programId = getProgramId();
    const [registryPda] = getRegistryPda(programId);

    const registry = await program.account.globalRegistry.fetch(registryPda);

    return {
      success: true,
      data: {
        totalProjects: registry.totalProjects.toNumber(),
        totalCreditsIssued: registry.totalCreditsIssued.toNumber(),
        admin: registry.admin.toString(),
        carbonTokenMint: registry.carbonTokenMint.toString(),
      },
    };
  } catch (error: any) {
    console.error('Fetch registry error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Fetch project data
 */
export async function fetchProjectData(
  connection: Connection,
  wallet: WalletContextState,
  projectId: string,
  projectOwner: PublicKey
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const program = getProgram(connection, wallet as any);
    const programId = getProgramId();
    const [projectPda] = getProjectPda(projectId, projectOwner, programId);

    const project = await program.account.project.fetch(projectPda);

    return {
      success: true,
      data: project,
    };
  } catch (error: any) {
    console.error('Fetch project error:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Helper to execute blockchain transaction with toast notifications
 */
export async function executeWithToast<T>(
  operation: () => Promise<T>,
  messages: {
    loading: string;
    success: string;
    error?: string;
  }
): Promise<T | null> {
  const toastId = toast.loading(messages.loading);

  try {
    const result = await operation();
    toast.success(messages.success, { id: toastId });
    return result;
  } catch (error: any) {
    if (isUserRejection(error)) {
      toast.error('Transaction cancelled', { id: toastId });
    } else {
      const errorMsg = messages.error || getErrorMessage(error);
      toast.error(errorMsg, { id: toastId });
    }
    return null;
  }
}
