/**
 * PDA utility functions for the Blue Carbon Registry
 * These functions help derive the Program Derived Addresses (PDAs) for various account types
 */

import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from './solana';

/**
 * Get the Project Account PDA for a given project ID
 */
export function getProjectAccount(projectId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('project'), Buffer.from(projectId)],
    PROGRAM_ID
  );
}

/**
 * Get the Project Metadata PDA for a given project ID
 */
export function getProjectMetadataAccount(projectId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), Buffer.from(projectId)],
    PROGRAM_ID
  );
}

/**
 * Get the Registry PDA
 */
export function getRegistryAccount(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('registry')],
    PROGRAM_ID
  );
}

/**
 * Get the Verifier PDA for a given verifier
 */
export function getVerifierAccount(verifierPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('verifier'), verifierPubkey.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Get the Monitoring Data PDA for a given project ID and timestamp
 */
export function getMonitoringDataAccount(projectId: string, timestamp: number): [PublicKey, number] {
  const timestampBuffer = Buffer.alloc(8);
  timestampBuffer.writeBigInt64LE(BigInt(timestamp), 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('monitoring'), Buffer.from(projectId), timestampBuffer],
    PROGRAM_ID
  );
}

/**
 * Get the Carbon Credit Token Mint PDA
 */
export function getCarbonTokenMintAccount(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('carbon_token_mint')],
    PROGRAM_ID
  );
}

/**
 * Get the Project Token Mint Authority PDA for a given project ID
 */
export function getProjectTokenMintAuthority(projectId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('project_token_authority'), Buffer.from(projectId)],
    PROGRAM_ID
  );
}

/**
 * Get the Marketplace Listing PDA for a given project ID and seller
 */
export function getMarketplaceListingAccount(
  projectId: string, 
  seller: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('marketplace_listing'), Buffer.from(projectId), seller.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Get the Project Verification PDA for a given project ID and verifier
 */
export function getVerificationAccount(
  projectId: string,
  verifier: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('verification'), Buffer.from(projectId), verifier.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Get the Project Impact Report PDA for a given project ID and timestamp
 */
export function getImpactReportAccount(
  projectId: string,
  timestamp: number
): [PublicKey, number] {
  const timestampBuffer = Buffer.alloc(8);
  timestampBuffer.writeBigInt64LE(BigInt(timestamp), 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('impact_report'), Buffer.from(projectId), timestampBuffer],
    PROGRAM_ID
  );
}