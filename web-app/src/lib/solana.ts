import * as anchor from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

// Import the IDL from your compiled program
export const PROGRAM_ID = new PublicKey('GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr');

export class BlueCarbonClient {
  private connection: Connection;
  private program: anchor.Program;
  private provider: anchor.AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(this.provider);
    
    // You'll need to add the IDL here from your compiled program
    // For now, we'll use a simplified interface
    this.program = new anchor.Program(
      {} as any, // IDL would go here
      PROGRAM_ID,
      this.provider
    );
  }

  async registerProject(
    projectId: string,
    ipfsCid: string,
    wallet: PublicKey
  ): Promise<string> {
    try {
      const [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('project'), wallet.toBuffer(), Buffer.from(projectId)],
        PROGRAM_ID
      );

      const tx = await this.program.methods
        .registerProject(projectId, ipfsCid)
        .accounts({
          project: projectPda,
          projectOwner: wallet,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error registering project:', error);
      throw error;
    }
  }

  async mintCredits(
    projectId: string,
    amount: number,
    tokenMint: PublicKey,
    recipientAccount: PublicKey,
    wallet: PublicKey
  ): Promise<string> {
    try {
      const [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('project'), wallet.toBuffer(), Buffer.from(projectId)],
        PROGRAM_ID
      );

      const tx = await this.program.methods
        .mintCredits(new anchor.BN(amount))
        .accounts({
          mint: tokenMint,
          project: projectPda,
          owner: wallet,
          recipientTokenAccount: recipientAccount,
          mintAuthority: projectPda,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error minting credits:', error);
      throw error;
    }
  }

  async transferCredits(
    fromAccount: PublicKey,
    toAccount: PublicKey,
    amount: number,
    authority: PublicKey
  ): Promise<string> {
    try {
      const tx = await this.program.methods
        .transferCredits(new anchor.BN(amount))
        .accounts({
          fromAccount,
          toAccount,
          fromAuthority: authority,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error transferring credits:', error);
      throw error;
    }
  }

  async retireCredits(
    fromAccount: PublicKey,
    amount: number,
    authority: PublicKey
  ): Promise<string> {
    try {
      const [retirementPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('retirement'), fromAccount.toBuffer()],
        PROGRAM_ID
      );

      const tx = await this.program.methods
        .retireCredits(new anchor.BN(amount))
        .accounts({
          fromAccount,
          retirementAccount: retirementPda,
          fromAuthority: authority,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error retiring credits:', error);
      throw error;
    }
  }
}
