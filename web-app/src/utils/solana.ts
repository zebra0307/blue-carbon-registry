import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';

// Import the raw IDL JSON directly 
import idlJson from '../../../target/idl/blue_carbon_registry.json';
const IDL = idlJson as any;

// Environment configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || 'GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr');

/**
 * Initialize Solana connection and program
 */
export function initializeSolana(wallet?: any) {
  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  
  if (!wallet) {
    console.log('No wallet provided to initializeSolana');
    return { connection, program: null, provider: null };
  }
  
  try {
    console.log('Initializing Solana with wallet:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toString(),
      hasSignTransaction: !!wallet.signTransaction,
      hasSendTransaction: !!wallet.sendTransaction,
      hasSignAllTransactions: !!wallet.signAllTransactions
    });
    
    // Check if wallet has required methods
    if (!wallet.publicKey) {
      throw new Error('Wallet public key not available');
    }
    
    if (!wallet.connected) {
      throw new Error('Wallet not connected');
    }

    // Create a wallet adapter wrapper that implements the interface Anchor expects
    const walletAdapter = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction?.bind(wallet) || (() => {
        throw new Error('Wallet does not support transaction signing');
      }),
      signAllTransactions: wallet.signAllTransactions?.bind(wallet) || (() => {
        throw new Error('Wallet does not support signing multiple transactions');
      }),
    };

    // Verify the wallet adapter has the required methods
    if (!walletAdapter.signTransaction || !walletAdapter.signAllTransactions) {
      throw new Error('Wallet adapter missing required signing methods');
    }
    
    // Create a provider with proper error handling
    const provider = new AnchorProvider(
      connection, 
      walletAdapter, 
      { 
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false
      }
    );
    
    console.log('Creating Anchor program with PROGRAM_ID:', PROGRAM_ID.toString());
    console.log('IDL version:', IDL.version);
    console.log('IDL name:', IDL.name);
    
    // Initialize the program with explicit program ID and additional error checking
    if (!IDL) {
      throw new Error('IDL not loaded properly');
    }

    if (!PROGRAM_ID) {
      throw new Error('Program ID not configured');
    }
    
    const program = new Program(IDL, provider);
    
    if (!program) {
      throw new Error('Failed to create Anchor program instance');
    }

    console.log('Solana program initialized successfully');
    console.log('Program methods available:', Object.keys(program.methods || {}));
    
    return { connection, program, provider };
  } catch (error) {
    console.error('Error initializing Solana program:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      walletConnected: wallet?.connected,
      walletPublicKey: wallet?.publicKey?.toString(),
      programId: PROGRAM_ID?.toString(),
      rpcEndpoint: RPC_ENDPOINT,
      idlLoaded: !!IDL
    });
    return { connection, program: null, provider: null };
  }
}

/**
 * Get project PDA (Program Derived Address)
 */
export function getProjectPDA(owner: PublicKey, projectId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('project'),
      owner.toBuffer(),
      Buffer.from(projectId)
    ],
    PROGRAM_ID
  );
}

/**
 * Get mint authority PDA
 */
export function getMintAuthorityPDA(owner: PublicKey, projectId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('project'),
      owner.toBuffer(),
      Buffer.from(projectId)
    ],
    PROGRAM_ID
  );
}

/**
 * Convert string amount to BN for Solana transactions
 */
export function toBN(amount: string | number): BN {
  return new BN(amount.toString());
}

/**
 * Format Solana public key for display
 */
export function formatPublicKey(pubkey: PublicKey, length: number = 8): string {
  const str = pubkey.toString();
  return `${str.substring(0, length)}...${str.substring(str.length - length)}`;
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(wallet: any): boolean {
  return wallet?.connected && wallet?.publicKey;
}

/**
 * Get account balance in SOL
 */
export async function getAccountBalance(connection: Connection, publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / web3.LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting account balance:', error);
    return 0;
  }
}