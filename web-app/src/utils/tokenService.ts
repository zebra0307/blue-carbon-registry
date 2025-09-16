// Enhanced Credit Minting Service
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, getAssociatedTokenAddress, mintTo } from '@solana/spl-token';
import { BN } from '@project-serum/anchor';
import { initializeSolana, getProjectPDA, getMintAuthorityPDA } from './solana';

export async function createProjectToken(
  wallet: any,
  projectId: string
): Promise<{ success: boolean; mintAddress?: PublicKey; error?: string }> {
  try {
    const { connection } = initializeSolana(wallet);
    
    // Create a new mint for this project's carbon credits
    const mint = await createMint(
      connection,
      wallet, // payer
      wallet.publicKey, // mint authority (should be PDA in production)
      wallet.publicKey, // freeze authority
      2 // decimals (0.01 = 10kg CO2)
    );

    console.log('Created carbon credit token mint:', mint.toString());
    
    return {
      success: true,
      mintAddress: mint
    };
  } catch (error) {
    console.error('Error creating project token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create token'
    };
  }
}

export async function mintCarbonCredits(
  wallet: any,
  projectId: string,
  amount: number, // in tonnes CO2
  mintAddress: PublicKey
): Promise<{ success: boolean; txSignature?: string; error?: string }> {
  try {
    if (!wallet?.connected || !wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    const { connection, program } = initializeSolana(wallet);
    if (!program) {
      throw new Error('Failed to initialize Solana program');
    }

    // Get or create associated token account for the project owner
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      wallet.publicKey
    );

    // Create associated token account if it doesn't exist
    try {
      await createAssociatedTokenAccount(
        connection,
        wallet,
        mintAddress,
        wallet.publicKey
      );
    } catch (error) {
      // Account might already exist, which is fine
      console.log('Associated token account might already exist');
    }

    // Generate PDAs
    const [projectPDA] = getProjectPDA(wallet.publicKey, projectId);
    const [mintAuthority] = getMintAuthorityPDA(wallet.publicKey, projectId);

    console.log('Minting carbon credits:', {
      projectId,
      amount,
      projectPDA: projectPDA.toString(),
      mintAddress: mintAddress.toString(),
      associatedTokenAccount: associatedTokenAccount.toString(),
      owner: wallet.publicKey.toString()
    });

    // Convert tonnes to token units (with 2 decimals)
    const tokenAmount = amount * 100; // 1 tonne = 100 token units

    // Create minting transaction
    const tx = await program.methods
      .mintCredits(new BN(tokenAmount))
      .accounts({
        mint: mintAddress,
        project: projectPDA,
        owner: wallet.publicKey,
        recipientTokenAccount: associatedTokenAccount,
        mintAuthority,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();

    // Send transaction
    const txSignature = await wallet.sendTransaction(tx, connection);
    await connection.confirmTransaction(txSignature, 'confirmed');

    console.log('Carbon credits minted successfully:', txSignature);

    return {
      success: true,
      txSignature,
    };
  } catch (error) {
    console.error('Error minting carbon credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mint credits',
    };
  }
}