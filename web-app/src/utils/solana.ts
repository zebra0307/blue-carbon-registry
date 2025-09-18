import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// Import the IDL JSON from web-app lib directory (available in both local and CI/CD)
import idlJson from '../lib/blue_carbon_registry.json';
const IDL = idlJson as any;

// Environment configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || 'GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr');

// Carbon credit token configuration
export const CARBON_TOKEN_DECIMALS = 6;

/**
 * Initialize Solana connection and program
 */
export function initializeSolana(wallet?: any) {
  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  
  if (!wallet) {
    return { connection, program: null, provider: null };
  }
  
  try {
    
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
    
    const provider = new AnchorProvider(connection, walletAdapter, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    
    const program = new Program(IDL, provider);
    
    return { connection, program, provider };
  } catch (error) {
    console.error('Failed to initialize Solana:', error);
    return { connection, program: null, provider: null };
  }
}

// ========== PDA FUNCTIONS ==========

/**
 * Get the Global Registry PDA
 */
export function getGlobalRegistryPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('registry')],
    PROGRAM_ID
  );
}

/**
 * Get the Carbon Token Mint PDA
 */
export function getCarbonTokenMintPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('carbon_token_mint')],
    PROGRAM_ID
  );
}

/**
 * Get the Mint Authority PDA for the registry (new version)
 */
export function getRegistryMintAuthorityPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('mint_authority')],
    PROGRAM_ID
  );
}

/**
 * Get project PDA from owner and project ID
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

// ========== REGISTRY FUNCTIONS ==========

/**
 * Initialize the carbon credit registry (admin only)
 */
export async function initializeRegistry(wallet: any) {
  try {
    const { connection, program } = initializeSolana(wallet);
    if (!program) throw new Error('Failed to initialize Solana program');

    const [registryPDA] = getGlobalRegistryPDA();
    const [carbonTokenMintPDA] = getCarbonTokenMintPDA();
    const [mintAuthorityPDA] = getRegistryMintAuthorityPDA();

    const tx = await program.methods
      .initializeRegistry(CARBON_TOKEN_DECIMALS)
      .accounts({
        registry: registryPDA,
        carbonTokenMint: carbonTokenMintPDA,
        mintAuthority: mintAuthorityPDA,
        admin: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return { success: true, transaction: tx };
  } catch (error: any) {
    console.error('Error initializing registry:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get global registry data
 */
export async function getGlobalRegistryData(wallet: any) {
  try {
    const { connection, program } = initializeSolana(wallet);
    if (!program) throw new Error('Failed to initialize Solana program');

    const [registryPDA] = getGlobalRegistryPDA();
    const registryData = await (program.account as any).globalRegistry.fetch(registryPDA);
    
    return {
      success: true,
      data: {
        totalCreditsIssued: registryData.totalCreditsIssued.toString(),
        totalProjects: registryData.totalProjects.toString(),
        admin: registryData.admin.toString(),
        carbonTokenMint: registryData.carbonTokenMint.toString(),
        mintAuthority: registryData.mintAuthority.toString()
      }
    };
  } catch (error: any) {
    console.error('Error fetching global registry data:', error);
    return { success: false, error: error.message };
  }
}

// ========== PROJECT FUNCTIONS ==========

/**
 * Register a new carbon credit project with enhanced data
 */
export async function registerProjectEnhanced(
  wallet: any, 
  projectId: string, 
  ipfsCid: string, 
  carbonTonsEstimated: number
) {
  try {
    const { connection, program } = initializeSolana(wallet);
    if (!program) throw new Error('Failed to initialize Solana program');

    const [projectPDA] = getProjectPDA(wallet.publicKey, projectId);
    const [registryPDA] = getGlobalRegistryPDA();

    const tx = await program.methods
      .registerProject(projectId, ipfsCid, new BN(carbonTonsEstimated))
      .accounts({
        project: projectPDA,
        registry: registryPDA,
        projectOwner: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return { success: true, transaction: tx, projectPDA };
  } catch (error: any) {
    console.error('Error registering enhanced project:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get project data from blockchain
 */
export async function getProjectData(wallet: any, owner: PublicKey, projectId: string) {
  try {
    const { connection, program } = initializeSolana(wallet);
    if (!program) throw new Error('Failed to initialize Solana program');

    const [projectPDA] = getProjectPDA(owner, projectId);
    const projectData = await (program.account as any).project.fetch(projectPDA);
    
    return {
      success: true,
      data: {
        projectId: projectData.projectId,
        owner: projectData.owner.toString(),
        ipfsCid: projectData.ipfsCid,
        carbonTonsEstimated: projectData.carbonTonsEstimated.toString(),
        verificationStatus: projectData.verificationStatus,
        creditsIssued: projectData.creditsIssued.toString(),
        tokensMinted: projectData.tokensMinted.toString(),
        bump: projectData.bump
      }
    };
  } catch (error: any) {
    console.error('Error fetching project data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify a project (admin only)
 */
export async function verifyProject(
  wallet: any, 
  projectOwner: PublicKey, 
  projectId: string, 
  verifiedCarbonTons: number
) {
  try {
    const { connection, program } = initializeSolana(wallet);
    if (!program) throw new Error('Failed to initialize Solana program');

    const [projectPDA] = getProjectPDA(projectOwner, projectId);
    const [registryPDA] = getGlobalRegistryPDA();

    const tx = await program.methods
      .verifyProject(new BN(verifiedCarbonTons))
      .accounts({
        project: projectPDA,
        registry: registryPDA,
        admin: wallet.publicKey,
      })
      .rpc();

    return { success: true, transaction: tx };
  } catch (error: any) {
    console.error('Error verifying project:', error);
    return { success: false, error: error.message };
  }
}

// ========== TOKEN FUNCTIONS ==========

/**
 * Mint carbon credits for verified projects
 */
export async function mintVerifiedCredits(
  wallet: any,
  projectId: string,
  amount: number,
  recipient: PublicKey
) {
  try {
    const { connection, program } = initializeSolana(wallet);
    if (!program) throw new Error('Failed to initialize Solana program');

    const [projectPDA] = getProjectPDA(wallet.publicKey, projectId);
    const [registryPDA] = getGlobalRegistryPDA();
    const [carbonTokenMintPDA] = getCarbonTokenMintPDA();
    const [mintAuthorityPDA] = getRegistryMintAuthorityPDA();

    // Get or create associated token account for recipient
    const recipientTokenAccount = getAssociatedTokenAddressSync(
      carbonTokenMintPDA,
      recipient
    );

    const tx = await program.methods
      .mintVerifiedCredits(new BN(amount * Math.pow(10, CARBON_TOKEN_DECIMALS))) // Convert to token units
      .accounts({
        project: projectPDA,
        registry: registryPDA,
        carbonTokenMint: carbonTokenMintPDA,
        recipientTokenAccount: recipientTokenAccount,
        mintAuthority: mintAuthorityPDA,
        owner: wallet.publicKey,
        recipient: recipient,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    return { success: true, transaction: tx, tokenAccount: recipientTokenAccount };
  } catch (error: any) {
    console.error('Error minting verified credits:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get carbon credit token balance for a wallet
 */
export async function getCarbonTokenBalance(wallet: any, owner?: PublicKey) {
  try {
    const { connection } = initializeSolana(wallet);
    const [carbonTokenMintPDA] = getCarbonTokenMintPDA();
    
    const targetOwner = owner || wallet.publicKey;
    const tokenAccount = getAssociatedTokenAddressSync(
      carbonTokenMintPDA,
      targetOwner
    );

    try {
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      return {
        success: true,
        balance: balance.value.uiAmount || 0,
        rawBalance: balance.value.amount,
        tokenAccount: tokenAccount.toString()
      };
    } catch (error) {
      // Account doesn't exist yet
      return {
        success: true,
        balance: 0,
        rawBalance: '0',
        tokenAccount: tokenAccount.toString()
      };
    }
  } catch (error: any) {
    console.error('Error getting carbon token balance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Transfer carbon credits between wallets
 */
export async function transferCredits(
  wallet: any,
  amount: number,
  toWallet: PublicKey
) {
  try {
    const { connection, program } = initializeSolana(wallet);
    if (!program) throw new Error('Failed to initialize Solana program');

    const [carbonTokenMintPDA] = getCarbonTokenMintPDA();
    
    const fromTokenAccount = getAssociatedTokenAddressSync(
      carbonTokenMintPDA,
      wallet.publicKey
    );
    
    const toTokenAccount = getAssociatedTokenAddressSync(
      carbonTokenMintPDA,
      toWallet
    );

    const tx = await program.methods
      .transferCredits(new BN(amount * Math.pow(10, CARBON_TOKEN_DECIMALS)))
      .accounts({
        fromAccount: fromTokenAccount,
        toAccount: toTokenAccount,
        fromAuthority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return { success: true, transaction: tx };
  } catch (error: any) {
    console.error('Error transferring credits:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convert number to BN (for backwards compatibility)
 */
export function toBN(value: number): BN {
  return new BN(value);
}

/**
 * Get project mint authority PDA (backwards compatibility)
 */
export function getMintAuthorityPDA(owner: PublicKey, projectId: string): [PublicKey, number] {
  return getProjectPDA(owner, projectId);
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Format public key for display
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

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: number | string, decimals: number = CARBON_TOKEN_DECIMALS): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Convert token amount to lamports (smallest unit)
 */
export function tokenToLamports(amount: number, decimals: number = CARBON_TOKEN_DECIMALS): BN {
  return new BN(Math.floor(amount * Math.pow(10, decimals)));
}

/**
 * Convert lamports to token amount
 */
export function lamportsToToken(lamports: number | BN, decimals: number = CARBON_TOKEN_DECIMALS): number {
  const num = typeof lamports === 'number' ? lamports : lamports.toNumber();
  return num / Math.pow(10, decimals);
}

// ========== TYPE DEFINITIONS ==========

/**
 * Project verification status enum
 */
export enum VerificationStatus {
  Pending = 'Pending',
  Verified = 'Verified', 
  Rejected = 'Rejected'
}

/**
 * Carbon credit project interface
 */
export interface CarbonProject {
  projectId: string;
  owner: PublicKey;
  ipfsCid: string;
  carbonTonsEstimated: number;
  verificationStatus: VerificationStatus;
  creditsIssued: number;
  tokensMinted: number;
  bump: number;
}

/**
 * Global registry interface  
 */
export interface GlobalRegistry {
  totalCreditsIssued: number;
  totalProjects: number;
  admin: PublicKey;
  mintAuthority: PublicKey;
  carbonTokenMint: PublicKey;
  bump: number;
  mintAuthorityBump: number;
}