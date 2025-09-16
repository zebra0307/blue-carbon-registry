import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { initializeSolana, getProjectPDA, getMintAuthorityPDA, toBN } from './solana';
import { Project } from '../types/blue_carbon_registry_real';

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  location: string;
  carbonCredits: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  ipfsCid?: string;
  blockchainData?: {
    projectPDA: string;
    owner: string;
    creditsIssued: number;
    txSignature?: string;
  };
}

/**
 * Register a new project on the blockchain
 */
export async function registerProject(
  wallet: any,
  projectData: ProjectData
): Promise<{ success: boolean; txSignature?: string; error?: string }> {
  try {
    if (!wallet?.connected || !wallet?.publicKey) {
      throw new Error('Wallet not connected. Please connect your wallet and try again.');
    }

    console.log('Attempting to initialize Solana program...');
    const { connection, program } = initializeSolana(wallet);
    if (!program) {
      console.error('Program initialization failed. Common causes:');
      console.error('1. Wallet not properly connected');
      console.error('2. Browser compatibility issues');
      console.error('3. Network connectivity problems');
      console.error('4. Missing wallet adapter methods');
      
      throw new Error('Failed to initialize Solana program. Please ensure your wallet is connected and try refreshing the page.');
    }

    // Generate project PDA
    const [projectPDA, bump] = getProjectPDA(wallet.publicKey, projectData.id);

    console.log('Registering project on blockchain:', {
      projectId: projectData.id,
      owner: wallet.publicKey.toString(),
      projectPDA: projectPDA.toString(),
      ipfsCid: projectData.ipfsCid || ''
    });

    // Create transaction using the correct account names (camelCase in TypeScript, snake_case in IDL)
    const tx = await program.methods
      .registerProject(projectData.id, projectData.ipfsCid || '')
      .accounts({
        project: projectPDA,
        projectOwner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    // Send transaction
    const txSignature = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(txSignature, 'confirmed');

    console.log('Project registration successful:', txSignature);

    return {
      success: true,
      txSignature,
    };
  } catch (error) {
    console.error('Error registering project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mint carbon credits for a project
 */
export async function mintCredits(
  wallet: any,
  projectId: string,
  amount: number,
  mintAddress: PublicKey,
  recipientTokenAccount: PublicKey
): Promise<{ success: boolean; txSignature?: string; error?: string }> {
  try {
    if (!wallet?.connected || !wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    const { connection, program } = initializeSolana(wallet);
    if (!program) {
      throw new Error('Failed to initialize Solana program');
    }

    // Generate PDAs
    const [projectPDA] = getProjectPDA(wallet.publicKey, projectId);
    const [mintAuthority] = getMintAuthorityPDA(wallet.publicKey, projectId);

    console.log('Minting credits on blockchain:', {
      projectId,
      amount,
      projectPDA: projectPDA.toString(),
      recipient: recipientTokenAccount.toString(),
      owner: wallet.publicKey.toString()
    });

    // Create transaction
    const tx = await program.methods
      .mintCredits(toBN(amount))
      .accounts({
        mint: mintAddress,
        project: projectPDA,
        owner: wallet.publicKey,
        recipientTokenAccount,
        mintAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();

    // Send transaction
    const txSignature = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(txSignature, 'confirmed');

    console.log('Credit minting successful:', txSignature);

    return {
      success: true,
      txSignature,
    };
  } catch (error) {
    console.error('Error minting credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Transfer carbon credits between accounts
 */
export async function transferCredits(
  wallet: any,
  fromAccount: PublicKey,
  toAccount: PublicKey,
  amount: number
): Promise<{ success: boolean; txSignature?: string; error?: string }> {
  try {
    if (!wallet?.connected || !wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    const { connection, program } = initializeSolana(wallet);
    if (!program) {
      throw new Error('Failed to initialize Solana program');
    }

    console.log('Transferring credits on blockchain:', {
      from: fromAccount.toString(),
      to: toAccount.toString(),
      amount,
      authority: wallet.publicKey.toString()
    });

    // Create transaction
    const tx = await program.methods
      .transferCredits(toBN(amount))
      .accounts({
        fromAccount,
        toAccount,
        fromAuthority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();

    // Send transaction
    const txSignature = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(txSignature, 'confirmed');

    console.log('Credit transfer successful:', txSignature);

    return {
      success: true,
      txSignature,
    };
  } catch (error) {
    console.error('Error transferring credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Retire carbon credits
 */
export async function retireCredits(
  wallet: any,
  retirementAccount: PublicKey,
  amount: number
): Promise<{ success: boolean; txSignature?: string; error?: string }> {
  try {
    if (!wallet?.connected || !wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    const { connection, program } = initializeSolana(wallet);
    if (!program) {
      throw new Error('Failed to initialize Solana program');
    }

    console.log('Retiring credits on blockchain:', {
      account: retirementAccount.toString(),
      amount,
      authority: wallet.publicKey.toString()
    });

    // Create transaction
    const tx = await program.methods
      .retireCredits(toBN(amount))
      .accounts({
        retirementAccount,
        fromAuthority: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();

    // Send transaction
    const txSignature = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(txSignature, 'confirmed');

    console.log('Credit retirement successful:', txSignature);

    return {
      success: true,
      txSignature,
    };
  } catch (error) {
    console.error('Error retiring credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch project data from blockchain
 */
export async function fetchProject(
  projectOwner: PublicKey,
  projectId: string
): Promise<{ success: boolean; project?: any; error?: string }> {
  try {
    const { connection, program } = initializeSolana();
    if (!program) {
      throw new Error('Failed to initialize Solana program');
    }

    const [projectPDA] = getProjectPDA(projectOwner, projectId);
    
    console.log('Fetching project from blockchain:', {
      projectId,
      owner: projectOwner.toString(),
      projectPDA: projectPDA.toString()
    });

    const projectAccount = await (program.account as any).project.fetch(projectPDA);

    console.log('Project fetched successfully:', projectAccount);

    return {
      success: true,
      project: projectAccount,
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Project not found',
    };
  }
}

/**
 * Get all projects for a wallet
 */
export async function fetchUserProjects(
  userWallet: PublicKey,
  wallet?: any
): Promise<{ success: boolean; projects?: any[]; error?: string }> {
  try {
    console.log('=== STARTING fetchUserProjects ===');
    console.log('User wallet:', userWallet.toString());
    console.log('Wallet object:', wallet ? 'provided' : 'not provided');

    const { connection, program } = initializeSolana(wallet);
    if (!program) {
      console.error('Program initialization failed');
      throw new Error('Failed to initialize Solana program');
    }

    console.log('Program initialized successfully');
    console.log('Program ID:', program.programId.toString());
    console.log('Available program accounts:', Object.keys(program.account));

    // Try different account names
    const possibleAccountNames = ['Project', 'project', 'ProjectAccount'];
    let allProjects: any[] = [];
    let accountName = '';

    for (const accountNameToTry of possibleAccountNames) {
      try {
        console.log(`Trying account name: ${accountNameToTry}`);
        if ((program.account as any)[accountNameToTry]) {
          allProjects = await (program.account as any)[accountNameToTry].all();
          accountName = accountNameToTry;
          console.log(`Success with account name: ${accountNameToTry}`);
          console.log('All projects found:', allProjects.length);
          break;
        } else {
          console.log(`Account ${accountNameToTry} not found in program`);
        }
      } catch (error) {
        console.log(`Failed with account name ${accountNameToTry}:`, error);
      }
    }

    if (!accountName) {
      console.error('No valid account name found');
      console.log('Available account types:', Object.keys(program.account));
      throw new Error('Could not find Project account type in program');
    }

    console.log(`Found ${allProjects.length} total projects using account name: ${accountName}`);
    
    // Log all projects for debugging
    allProjects.forEach((project: any, index: number) => {
      console.log(`Project ${index}:`, {
        pubkey: project.publicKey.toString(),
        account: project.account
      });
    });
    
    // Filter projects by owner
    const userProjects = allProjects.filter((project: any) => {
      const projectOwner = project.account.owner.toString();
      const targetOwner = userWallet.toString();
      console.log('Comparing owners:', { 
        projectOwner, 
        targetOwner, 
        match: projectOwner === targetOwner,
        projectId: project.account.project_id || project.account.projectId
      });
      return projectOwner === targetOwner;
    });

    console.log('User projects found:', userProjects.length);
    console.log('=== END fetchUserProjects ===');

    return {
      success: true,
      projects: userProjects.map((p: any) => p.account),
    };
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch projects',
    };
  }
}