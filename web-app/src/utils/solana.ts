import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getMint,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError
} from '@solana/spl-token';

// Import the IDL JSON from web-app lib directory (available in both local and CI/CD)
import idlJson from '../lib/blue_carbon_registry.json';
const IDL = idlJson as any;

// Environment configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '6q7u2DH9vswSbpPYZLyaamAyBXQeXBCPfcgmi1dikuQB');

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
    [Buffer.from('registry_v3')],
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

// Note: Mint authority is now the registry itself, no separate PDA needed

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

    const tx = await program.methods
      .initializeRegistry(CARBON_TOKEN_DECIMALS)
      .accounts({
        registry: registryPDA,
        carbonTokenMint: carbonTokenMintPDA,
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
 * Get all projects owned by a wallet
 */
export async function getAllUserProjects(wallet: any, ownerPublicKey: PublicKey) {
  try {
    console.log('🔧 getAllUserProjects called for:', ownerPublicKey.toString());
    console.log('🔧 Program ID:', PROGRAM_ID.toString());
    console.log('🔧 RPC Endpoint:', RPC_ENDPOINT);
    
    // Get all program accounts directly from the connection
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');
    const allProgramAccounts = await connection.getProgramAccounts(PROGRAM_ID);
    console.log('🔧 Total program accounts found:', allProgramAccounts.length);
    
    // Decode account data and filter by actual owner
    const userProjects: any[] = [];
    
    for (const account of allProgramAccounts) {
      try {
        const data = account.account.data;
        
        if (data.length >= 40) {
          // Decode the account data structure
          let offset = 8; // Skip discriminator
          
          // Read project_id string (4 bytes length + string)
          const projectIdLength = data.readUInt32LE(offset);
          offset += 4;
          const projectId = data.slice(offset, offset + projectIdLength).toString('utf8');
          offset += projectIdLength;
          
          // Read owner pubkey (32 bytes)
          const ownerBytes = data.slice(offset, offset + 32);
          const accountOwner = new PublicKey(ownerBytes);
          offset += 32;
          
          // Check if this account belongs to the requested owner
          if (accountOwner.equals(ownerPublicKey)) {
            // Read ipfs_cid string (4 bytes length + string)
            const ipfsCidLength = data.readUInt32LE(offset);
            offset += 4;
            const ipfsCid = data.slice(offset, offset + ipfsCidLength).toString('utf8');
            offset += ipfsCidLength;
            
            // Read carbon_tons_estimated (8 bytes)
            const carbonTons = data.readBigUInt64LE(offset);
            offset += 8;
            
            // Read verification_status (1 byte)
            const verified = data.readUInt8(offset) === 1;
            offset += 1;
            
            // Read credits_issued (8 bytes)
            const creditsIssued = data.readBigUInt64LE(offset);
            offset += 8;
            
            // Read tokens_minted (8 bytes)
            const tokensMinted = data.readBigUInt64LE(offset);
            
            userProjects.push({
              projectId: projectId,
              owner: accountOwner.toString(),
              ipfsCid: ipfsCid,
              carbonTonsEstimated: carbonTons.toString(),
              verificationStatus: verified,
              creditsIssued: creditsIssued.toString(),
              tokensMinted: tokensMinted.toString(),
              bump: 255,
              publicKey: account.pubkey.toString()
            });
            
            console.log('✅ Found user project:', projectId, 'for owner:', accountOwner.toString());
          }
        }
      } catch (decodeError) {
        console.log('⚠️ Could not decode account:', account.pubkey.toString(), decodeError);
      }
    }
    
    console.log('🔧 Found', userProjects.length, 'projects for user:', ownerPublicKey.toString());

    return {
      success: true,
      projects: userProjects
    };
  } catch (error: any) {
    console.error('Error fetching user projects:', error);
    return { success: false, error: error.message, projects: [] };
  }
}

/**
 * Get all projects from all users (for marketplace)
 */
export async function getAllProjects(wallet: any) {
  try {
    console.log('🌐 getAllProjects called');
    
    // Initialize program with wallet if available, otherwise just use connection
    const { connection, program } = initializeSolana(wallet);
    
    // Get all program accounts without filtering to find all project accounts
    // In a production environment, we should use proper filters
    const programAccounts = await connection.getProgramAccounts(PROGRAM_ID);
    console.log('🌐 Found program accounts:', programAccounts.length);

    // Parse actual project data from accounts
    const projects = [];
    
    for (const account of programAccounts) {
      try {
        let project;
        
        // Manual deserialization of account data
        const data = account.account.data;
        
        if (data.length >= 40) {
          let offset = 8; // Skip discriminator
          
          try {
            // Read project_id string
            const projectIdLength = data.readUInt32LE(offset);
            if (projectIdLength > 0 && projectIdLength < 100) { // Sanity check
              offset += 4;
              const projectId = data.slice(offset, offset + projectIdLength).toString('utf8');
              offset += projectIdLength;
              
              // Read owner pubkey (32 bytes)
              const ownerBytes = data.slice(offset, offset + 32);
              const owner = new PublicKey(ownerBytes);
              offset += 32;
              
              // Read ipfs_cid string
              const ipfsCidLength = data.readUInt32LE(offset);
              if (ipfsCidLength > 0 && ipfsCidLength < 100) { // Sanity check
                offset += 4;
                const ipfsCid = data.slice(offset, offset + ipfsCidLength).toString('utf8');
                offset += ipfsCidLength;
                
                // Read carbon_tons_estimated (8 bytes)
                const carbonTons = data.readBigUInt64LE(offset);
                offset += 8;
                
                // Read verification_status (1 byte)
                const verified = data.readUInt8(offset) === 1;
                offset += 1;
                
                // Read credits_issued (8 bytes)
                const creditsIssued = data.readBigUInt64LE(offset);
                offset += 8;
                
                // Read tokens_minted (8 bytes)
                const tokensMinted = data.readBigUInt64LE(offset);
                offset += 8;
                
                // Read bump (1 byte)
                const bump = data.readUInt8(offset);
                
                project = {
                  projectId,
                  owner: owner.toString(),
                  ipfsCid,
                  carbonTonsEstimated: carbonTons.toString(),
                  verificationStatus: verified,
                  creditsIssued: creditsIssued.toString(),
                  tokensMinted: tokensMinted.toString(),
                  bump,
                  publicKey: account.pubkey.toString()
                };
              }
            }
          } catch (error) {
            // Skip this entry if it doesn't match our expected format
            console.debug('Account is not a project account, skipping:', 
              error instanceof Error ? error.message : 'Unknown parsing error');
          }
        }
        
        if (project) {
          projects.push(project);
        }
      } catch (e) {
        console.error('Error parsing project account:', e);
        // Skip this account if parsing fails
      }
    }

    console.log('🌐 Successfully parsed projects:', projects.length);
    return {
      success: true,
      projects: projects
    };
  } catch (error: any) {
    console.error('Error fetching all projects:', error);
    return { success: false, error: error.message, projects: [] };
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
 * Create and initialize carbon credit token for a project
 * This creates a project-specific token that can be traded/retired
 */
export async function createCarbonCreditToken(
  wallet: any,
  projectId: string,
  tokenName: string,
  tokenSymbol: string,
  totalSupply: number
) {
  try {
    const { connection, program } = initializeSolana(wallet);
    if (!connection) throw new Error('Failed to initialize Solana connection');

    // Create a new mint for this specific project's carbon credits
    const mintKeypair = Keypair.generate();
    
    // Create the mint account
    const mint = await createMint(
      connection,
      wallet, // payer
      wallet.publicKey, // mint authority
      wallet.publicKey, // freeze authority
      CARBON_TOKEN_DECIMALS, // decimals
      mintKeypair // mint keypair
    );

    // Create associated token account for the project owner
    const ownerTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet, // payer
      mint, // mint
      wallet.publicKey // owner
    );

    // Mint the initial supply to the owner
    const mintAmount = totalSupply * Math.pow(10, CARBON_TOKEN_DECIMALS);
    const mintTx = await mintTo(
      connection,
      wallet, // payer
      mint, // mint
      ownerTokenAccount.address, // destination
      wallet.publicKey, // authority
      mintAmount // amount
    );

    return {
      success: true,
      mint: mint.toString(),
      tokenAccount: ownerTokenAccount.address.toString(),
      mintTransaction: mintTx,
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals: CARBON_TOKEN_DECIMALS
    };
  } catch (error: any) {
    console.error('Error creating carbon credit token:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mint additional carbon credits for a project (admin only)
 */
export async function mintCarbonCredits(
  wallet: any,
  mintAddress: string,
  recipientAddress: string,
  amount: number
) {
  try {
    const { connection } = initializeSolana(wallet);
    if (!connection) throw new Error('Failed to initialize Solana connection');

    const mint = new PublicKey(mintAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get or create associated token account for recipient
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet, // payer
      mint, // mint
      recipient // owner
    );

    // Mint tokens to recipient
    const mintAmount = amount * Math.pow(10, CARBON_TOKEN_DECIMALS);
    const mintTx = await mintTo(
      connection,
      wallet, // payer
      mint, // mint
      recipientTokenAccount.address, // destination
      wallet.publicKey, // authority
      mintAmount // amount
    );

    return {
      success: true,
      transaction: mintTx,
      tokenAccount: recipientTokenAccount.address.toString(),
      amount,
      recipient: recipientAddress
    };
  } catch (error: any) {
    console.error('Error minting carbon credits:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get token account balance for any mint
 */
export async function getTokenBalance(
  wallet: any,
  mintAddress: string,
  ownerAddress?: string
) {
  try {
    const { connection } = initializeSolana(wallet);
    if (!connection) throw new Error('Failed to initialize Solana connection');

    const mint = new PublicKey(mintAddress);
    const owner = ownerAddress ? new PublicKey(ownerAddress) : wallet.publicKey;
    
    const tokenAccount = getAssociatedTokenAddressSync(mint, owner);

    try {
      const accountInfo = await getAccount(connection, tokenAccount);
      const mintInfo = await getMint(connection, mint);
      
      return {
        success: true,
        balance: Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals),
        rawBalance: accountInfo.amount.toString(),
        tokenAccount: tokenAccount.toString(),
        mint: mintAddress,
        decimals: mintInfo.decimals
      };
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError) {
        return {
          success: true,
          balance: 0,
          rawBalance: '0',
          tokenAccount: tokenAccount.toString(),
          mint: mintAddress,
          decimals: CARBON_TOKEN_DECIMALS
        };
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error getting token balance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all token accounts for a wallet
 */
export async function getAllTokenAccounts(wallet: any, ownerAddress?: string) {
  try {
    const { connection } = initializeSolana(wallet);
    if (!connection) throw new Error('Failed to initialize Solana connection');

    const owner = ownerAddress ? new PublicKey(ownerAddress) : wallet.publicKey;
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      owner,
      { programId: TOKEN_PROGRAM_ID }
    );

    const accounts = tokenAccounts.value.map((accountInfo) => {
      const parsedInfo = accountInfo.account.data.parsed.info;
      return {
        address: accountInfo.pubkey.toString(),
        mint: parsedInfo.mint,
        balance: parsedInfo.tokenAmount.uiAmount || 0,
        rawBalance: parsedInfo.tokenAmount.amount,
        decimals: parsedInfo.tokenAmount.decimals
      };
    });

    return {
      success: true,
      accounts,
      count: accounts.length
    };
  } catch (error: any) {
    console.error('Error getting token accounts:', error);
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

// Export alias for registerProject to match our registration form
export const registerProject = registerProjectEnhanced;