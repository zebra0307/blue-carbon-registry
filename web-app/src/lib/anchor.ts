import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

// Import the IDL
import idl from '../../../target/idl/blue_carbon_registry.json';
import type { BlueCarbonRegistry } from '../../../target/types/blue_carbon_registry';

/**
 * Get the Anchor program instance
 * @param connection Solana connection
 * @param wallet Wallet adapter instance
 * @returns Typed Anchor program
 */
export function getProgram(
  connection: Connection,
  wallet: Wallet
): Program<BlueCarbonRegistry> {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );

  const programId = new PublicKey(idl.address);
  return new Program(idl as any, provider) as Program<BlueCarbonRegistry>;
}

/**
 * Get the global registry PDA
 * @param programId Program ID
 * @returns [PDA, bump]
 */
export function getRegistryPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('registry_v3')],
    programId
  );
}

/**
 * Get a project PDA
 * @param projectId Unique project identifier
 * @param owner Project owner public key
 * @param programId Program ID
 * @returns [PDA, bump]
 */
export function getProjectPda(
  projectId: string,
  owner: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('project'), owner.toBuffer(), Buffer.from(projectId)],
    programId
  );
}

/**
 * Get a verification node PDA
 * @param projectPda Project PDA
 * @param programId Program ID
 * @returns [PDA, bump]
 */
export function getVerificationNodePda(
  projectPda: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('verification_node'), projectPda.toBuffer()],
    programId
  );
}

/**
 * Get a monitoring data PDA
 * @param projectPda Project PDA
 * @param timestamp Unix timestamp
 * @param programId Program ID
 * @returns [PDA, bump]
 */
export function getMonitoringDataPda(
  projectPda: PublicKey,
  timestamp: number,
  programId: PublicKey
): [PublicKey, number] {
  const timestampBuf = new BN(timestamp).toArrayLike(Buffer, 'le', 8);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('monitoring_data'), projectPda.toBuffer(), timestampBuf],
    programId
  );
}

/**
 * Get an impact report PDA
 * @param projectPda Project PDA
 * @param reportId Report identifier
 * @param programId Program ID
 * @returns [PDA, bump]
 */
export function getImpactReportPda(
  projectPda: PublicKey,
  reportId: string,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('impact_report'), projectPda.toBuffer(), Buffer.from(reportId)],
    programId
  );
}

/**
 * Get a marketplace listing PDA
 * @param listingId Listing identifier
 * @param programId Program ID
 * @returns [PDA, bump]
 */
export function getMarketplaceListingPda(
  listingId: string,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('marketplace_listing'), Buffer.from(listingId)],
    programId
  );
}

/**
 * Get the carbon credit mint PDA
 * @param programId Program ID
 * @returns [PDA, bump]
 */
export function getCarbonMintPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('carbon_token_mint_v3')],
    programId
  );
}

/**
 * Get program ID from IDL
 * @returns Program PublicKey
 */
export function getProgramId(): PublicKey {
  return new PublicKey(idl.address);
}

/**
 * Convert lamports to SOL
 * @param lamports Amount in lamports
 * @returns Amount in SOL
 */
export function lamportsToSol(lamports: number | BN): number {
  const amount = typeof lamports === 'number' ? lamports : lamports.toNumber();
  return amount / 1_000_000_000;
}

/**
 * Convert SOL to lamports
 * @param sol Amount in SOL
 * @returns Amount in lamports
 */
export function solToLamports(sol: number): BN {
  return new BN(Math.floor(sol * 1_000_000_000));
}
