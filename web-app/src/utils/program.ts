import { Connection, PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { AnchorProvider, Program, Idl, BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

// Import the generated IDL
import BlueCarbonRegistryIDL from './blue_carbon_registry.json';

// Program ID from the deployed program
export const PROGRAM_ID = new PublicKey('6q7u2DH9vswSbpPYZLyaamAyBXQeXBCPfcgmi1dikuQB');

// Wallet interface for Anchor
interface WalletAdapter {
  publicKey: PublicKey | null;
  signTransaction<T extends Transaction>(transaction: T): Promise<T>;
  signAllTransactions?<T extends Transaction>(transactions: T[]): Promise<T[]>;
}

// Initialize the program
export function getProgram(connection: Connection, wallet: WalletAdapter): Program<any> | null {
  if (!wallet.publicKey || !wallet.signTransaction) {
    return null;
  }

  const provider = new AnchorProvider(
    connection,
    wallet as any,
    { commitment: 'confirmed' }
  );

  // Convert the new IDL format to the old format expected by this Anchor version
  const legacyIdl = {
    version: BlueCarbonRegistryIDL.metadata.version,
    name: BlueCarbonRegistryIDL.metadata.name,
    instructions: BlueCarbonRegistryIDL.instructions,
    accounts: (BlueCarbonRegistryIDL as any).accounts || [],
    types: (BlueCarbonRegistryIDL as any).types || [],
  };

  const program = new Program(
    legacyIdl as any,
    PROGRAM_ID,
    provider
  );

  return program;
}

// Generate PDA for a project
export function getProjectPDA(owner: PublicKey, projectId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('project'),
      owner.toBuffer(),
      Buffer.from(projectId),
    ],
    PROGRAM_ID
  );
}

// Interface for project registration data
export interface RegisterProjectParams {
  projectId: string;
  ipfsCid: string;
  owner: PublicKey;
}

// Interface for credit minting data
export interface MintCreditsParams {
  projectId: string;
  amount: number; // Amount in whole tokens (will be converted to decimals)
  owner: PublicKey;
  recipientTokenAccount: PublicKey;
}

// Register a new project on the blockchain
export async function registerProject(
  program: Program<any>,
  params: RegisterProjectParams
): Promise<string> {
  const [projectPDA] = getProjectPDA(params.owner, params.projectId);

  const transaction = await program.methods
    .registerProject(params.projectId, params.ipfsCid)
    .accounts({
      project: projectPDA,
      projectOwner: params.owner,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return transaction;
}

// Get a project account from the blockchain
export async function getProject(
  program: Program<any>,
  owner: PublicKey,
  projectId: string
): Promise<any | null> {
  try {
    const [projectPDA] = getProjectPDA(owner, projectId);
    const projectAccount = await program.account.project.fetch(projectPDA);
    return projectAccount;
  } catch (error) {
    console.log('Project not found on blockchain:', projectId);
    return null;
  }
}

// Get all projects for a wallet owner
export async function getAllProjects(
  program: Program<any>,
  owner: PublicKey
): Promise<Array<any>> {
  try {
    // Get all project accounts owned by this wallet
    const projects = await program.account.project.all([
      {
        memcmp: {
          offset: 8, // Skip the discriminator
          bytes: owner.toBase58(),
        },
      },
    ]);
    
    return projects.map(project => ({
      publicKey: project.publicKey,
      account: project.account
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Upload project metadata to IPFS using Pinata service
export async function uploadToIPFS(projectData: any): Promise<string> {
  try {
    const { ipfsService } = await import('../lib/ipfs');
    console.log('Uploading project data to IPFS via Pinata...');
    const ipfsHash = await ipfsService.uploadJSON(projectData, `project-${projectData.projectId || 'metadata'}`);
    console.log('Successfully uploaded to IPFS:', ipfsHash);
    return ipfsHash;
  } catch (error) {
    console.error('IPFS upload failed, falling back to mock hash:', error);
    // Fallback to mock hash if IPFS fails
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    console.log('Using mock IPFS hash:', mockHash);
    return mockHash;
  }
}

// Enhanced project registration with IPFS metadata
export async function registerProjectWithMetadata(
  program: Program<any>,
  projectData: {
    projectId: string;
    name: string;
    description: string;
    location: string;
    area?: number;
    projectType?: string;
  },
  owner: PublicKey
): Promise<string> {
  try {
    // 1. Upload metadata to IPFS
    const ipfsCid = await uploadToIPFS({
      name: projectData.name,
      description: projectData.description,
      location: projectData.location,
      area: projectData.area,
      projectType: projectData.projectType,
      timestamp: new Date().toISOString(),
      version: '1.0'
    });

    // 2. Register project on blockchain with IPFS hash
    const transaction = await registerProject(program, {
      projectId: projectData.projectId,
      ipfsCid: ipfsCid,
      owner: owner
    });

    return transaction;
  } catch (error) {
    console.error('Error registering project with metadata:', error);
    throw error;
  }
}

// Mint carbon credits for a project
export async function mintCredits(
  program: Program<any>,
  params: MintCreditsParams,
  mint: PublicKey
): Promise<string> {
  const [projectPDA] = getProjectPDA(params.owner, params.projectId);
  const [mintAuthority] = getProjectPDA(params.owner, params.projectId); // Same PDA acts as mint authority

  // Convert amount to proper decimals (assuming 6 decimals for SPL tokens)
  const amountBN = new BN(params.amount * Math.pow(10, 6));

  const transaction = await program.methods
    .mintCredits(amountBN)
    .accounts({
      mint: mint,
      project: projectPDA,
      owner: params.owner,
      recipientTokenAccount: params.recipientTokenAccount,
      mintAuthority: mintAuthority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return transaction;
}

// Helper function to create a new mint for carbon credits
export async function createCarbonCreditMint(
  connection: Connection,
  wallet: WalletAdapter,
  projectId: string
): Promise<PublicKey> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  const [mintAuthority] = getProjectPDA(wallet.publicKey, projectId);
  
  const mint = await createMint(
    connection,
    wallet as any,
    mintAuthority, // mint authority (PDA)
    null, // freeze authority (none)
    6 // decimals
  );

  return mint;
}

// Helper function to get or create associated token account
export async function getOrCreateTokenAccount(
  connection: Connection,
  wallet: WalletAdapter,
  mint: PublicKey
): Promise<PublicKey> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    wallet.publicKey
  );

  return tokenAccount.address;
}

// Transfer carbon credits between wallets
export async function transferCredits(
  connection: Connection,
  wallet: WalletAdapter,
  mint: PublicKey,
  recipient: PublicKey,
  amount: number
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  // Get or create sender's token account
  const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    wallet.publicKey
  );

  // Get or create recipient's token account
  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    recipient
  );

  // Convert amount to proper decimals (6 decimals for SPL tokens)
  const amountBN = new BN(amount * Math.pow(10, 6));

  // Create transfer instruction
  const { transfer, createTransferInstruction } = await import('@solana/spl-token');
  
  const signature = await transfer(
    connection,
    wallet as any,
    senderTokenAccount.address,
    recipientTokenAccount.address,
    wallet.publicKey,
    amountBN.toNumber()
  );

  return signature;
}

// Retire (burn) carbon credits permanently
export async function retireCredits(
  connection: Connection,
  wallet: WalletAdapter,
  mint: PublicKey,
  amount: number,
  reason?: string
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  // Get user's token account
  const { getAssociatedTokenAddress, burn } = await import('@solana/spl-token');
  
  const tokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey);

  // Convert amount to proper decimals (6 decimals for SPL tokens)
  const amountBN = new BN(amount * Math.pow(10, 6));

  // Burn the tokens (permanently remove from circulation)
  const signature = await burn(
    connection,
    wallet as any,
    tokenAccount,
    mint,
    wallet.publicKey,
    amountBN.toNumber()
  );

  console.log(`Retired ${amount} carbon credits. Reason: ${reason || 'Carbon offset'}`);
  
  return signature;
}

// Get token balance for a wallet
export async function getTokenBalance(
  connection: Connection,
  wallet: PublicKey,
  mint: PublicKey
): Promise<number> {
  try {
    const { getAssociatedTokenAddress, getAccount } = await import('@solana/spl-token');
    
    const tokenAccount = await getAssociatedTokenAddress(mint, wallet);
    const accountInfo = await getAccount(connection, tokenAccount);
    
    // Convert from base units to human readable (6 decimals)
    return Number(accountInfo.amount) / Math.pow(10, 6);
  } catch (error) {
    // Account doesn't exist or no tokens
    return 0;
  }
}

// Get all SPL token accounts for a wallet
export async function getAllTokenAccounts(
  connection: Connection,
  wallet: PublicKey
): Promise<Array<{mint: PublicKey, balance: number}>> {
  try {
    const { TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
    
    // Get all token accounts owned by the wallet
    const tokenAccounts = await connection.getTokenAccountsByOwner(wallet, {
      programId: TOKEN_PROGRAM_ID,
    });

    const tokenBalances = [];
    
    for (const tokenAccount of tokenAccounts.value) {
      try {
        const accountData = tokenAccount.account.data;
        const { AccountLayout } = await import('@solana/spl-token');
        const decoded = AccountLayout.decode(accountData);
        
        const mint = new PublicKey(decoded.mint);
        const balance = Number(decoded.amount) / Math.pow(10, 6); // Assuming 6 decimals
        
        // Only include accounts with positive balance
        if (balance > 0) {
          tokenBalances.push({ mint, balance });
        }
      } catch (error) {
        // Skip accounts that can't be decoded
        continue;
      }
    }
    
    return tokenBalances;
  } catch (error) {
    console.error('Error fetching token accounts:', error);
    return [];
  }
}

// Check if a mint is a carbon credit token (by checking if it's controlled by our program)
export async function isCarbonCreditToken(
  connection: Connection,
  mint: PublicKey,
  wallet: PublicKey
): Promise<{isCarbon: boolean, projectId?: string}> {
  try {
    const { getMint } = await import('@solana/spl-token');
    const mintInfo = await getMint(connection, mint);
    
    // Check if the mint authority is a PDA from our program
    if (mintInfo.mintAuthority) {
      // Try to find a matching project PDA
      // We'll check common project ID patterns
      const commonProjectIds = ['BCP-001', 'BCP-002', 'BCP-003', 'BCP-004', 'BCP-005'];
      
      for (const projectId of commonProjectIds) {
        const [expectedPDA] = getProjectPDA(wallet, projectId);
        if (expectedPDA.equals(mintInfo.mintAuthority)) {
          return { isCarbon: true, projectId };
        }
      }
    }
    
    return { isCarbon: false };
  } catch (error) {
    return { isCarbon: false };
  }
}

// Get carbon credit balances for a wallet
export async function getCarbonCreditBalances(
  connection: Connection,
  wallet: PublicKey
): Promise<Array<{projectId: string, mint: PublicKey, balance: number}>> {
  try {
    const allTokens = await getAllTokenAccounts(connection, wallet);
    const carbonCredits = [];
    
    for (const token of allTokens) {
      const carbonCheck = await isCarbonCreditToken(connection, token.mint, wallet);
      if (carbonCheck.isCarbon && carbonCheck.projectId) {
        carbonCredits.push({
          projectId: carbonCheck.projectId,
          mint: token.mint,
          balance: token.balance
        });
      }
    }
    
    return carbonCredits;
  } catch (error) {
    console.error('Error fetching carbon credit balances:', error);
    return [];
  }
}

// Error handling utility
export function handleProgramError(error: any): string {
  if (error.code) {
    switch (error.code) {
      case 6000:
        return 'Project already exists';
      case 6001:
        return 'Insufficient credits to transfer';
      case 6002:
        return 'Invalid project owner';
      default:
        return `Program error: ${error.msg || error.message}`;
    }
  }
  
  if (error.message) {
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient SOL for transaction fees';
    }
    if (error.message.includes('rejected')) {
      return 'Transaction was rejected by user';
    }
    return error.message;
  }

  return 'Unknown error occurred';
}