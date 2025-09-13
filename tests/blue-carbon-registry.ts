import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlueCarbonRegistry } from "../target/types/blue_carbon_registry";
import {
  PublicKey,
  Keypair,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("blue-carbon-registry", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BlueCarbonRegistry as Program<BlueCarbonRegistry>;

  let projectOwner: Keypair;
  let projectPda: PublicKey;
  let tokenMint: PublicKey;
  let projectTokenAccount: PublicKey;
  let investorTokenAccount: PublicKey;
  let retirementAccount: PublicKey;

  const projectId = "BCP-001";
  const ipfsCid = "QmYwAPJzv5CZsnAzt8auVKRQm6VLw4Dy8YQANhBBfmGjw8";
  
  // Test constants
  const TOKEN_DECIMALS = 6;
  const INITIAL_MINT_AMOUNT = 1000;
  const TRANSFER_AMOUNT = 500;
  const RETIREMENT_AMOUNT = 250;

  before(async () => {
    try {
      projectOwner = Keypair.generate();

      // Airdrop SOL to project owner
      const airdropSignature = await provider.connection.requestAirdrop(
        projectOwner.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSignature, "confirmed");

      // Derive the project PDA
      [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), projectOwner.publicKey.toBuffer(), Buffer.from(projectId)],
        program.programId
      );
      
      console.log("Test setup completed successfully");
    } catch (error) {
      console.error("Test setup failed:", error);
      throw error;
    }
  });

  it("Registers a project successfully", async () => {
    const tx = await program.methods
      .registerProject(projectId, ipfsCid)
      .accounts({
        project: projectPda,
        projectOwner: projectOwner.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([projectOwner])
      .rpc();
    
    console.log("Project registration transaction signature:", tx);
    
    // Fetch the project account and verify its data
    const projectAccount = await program.account.project.fetch(projectPda);

    assert.equal(projectAccount.projectId, projectId);
    assert.equal(
      projectAccount.owner.toString(),
      projectOwner.publicKey.toString()
    );
    assert.equal(projectAccount.ipfsCid, ipfsCid);
    assert.equal(projectAccount.creditsIssued.toString(), "0");
    
    console.log("✅ Project registered successfully");
  });
  
  it("Mints credits successfully", async () => {
    // Create token mint with project PDA as mint authority
    tokenMint = await createMint(
      provider.connection,
      projectOwner,
      projectPda, // Project PDA is the mint authority
      null,
      6, // TOKEN_DECIMALS for the token
    );

    console.log("Token mint created:", tokenMint.toString());

    // Create token account for the project owner (not PDA)
    projectTokenAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        projectOwner,
        tokenMint,
        projectOwner.publicKey, // Owned by project owner, not PDA
      )
    ).address;

    console.log("Project token account created:", projectTokenAccount.toString());

    const amountToMint = new anchor.BN(INITIAL_MINT_AMOUNT * (10 ** TOKEN_DECIMALS)); // 1000 tokens with 6 decimals
    
    const tx = await program.methods
      .mintCredits(amountToMint)
      .accounts({
        project: projectPda,
        owner: projectOwner.publicKey,
        mint: tokenMint,
        recipientTokenAccount: projectTokenAccount,
        mintAuthority: projectPda,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([projectOwner])
      .rpc();
    
    console.log("Mint credits transaction signature:", tx);
    
    // Verify the project account was updated
    const projectAccount = await program.account.project.fetch(projectPda);
    const tokenAccountInfo = await getAccount(
      provider.connection,
      projectTokenAccount
    );
    
    assert.equal(projectAccount.creditsIssued.toString(), amountToMint.toString());
    assert.equal(tokenAccountInfo.amount.toString(), amountToMint.toString());
    
    console.log("✅ Credits minted successfully");
  });

  it("Transfers credits successfully", async () => {
    // Create token account for investor (owned by provider wallet)
    investorTokenAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        projectOwner,
        tokenMint,
        provider.wallet.publicKey,
      )
    ).address;

    console.log("Investor token account created:", investorTokenAccount.toString());

    const amountToTransfer = new anchor.BN(TRANSFER_AMOUNT * (10 ** TOKEN_DECIMALS)); // 500 tokens
    
    // Transfer from project owner's token account to investor token account
    const tx = await program.methods
      .transferCredits(amountToTransfer)
      .accounts({
        fromAccount: projectTokenAccount,
        toAccount: investorTokenAccount,
        fromAuthority: projectOwner.publicKey, // Project owner is the authority
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([projectOwner])
      .rpc();
      
    console.log("Transfer credits transaction signature:", tx);
      
    // Verify the transfer
    const investorTokenAccountInfo = await getAccount(
      provider.connection,
      investorTokenAccount
    );
    
    assert.equal(
      investorTokenAccountInfo.amount.toString(),
      amountToTransfer.toString()
    );
    
    console.log("✅ Credits transferred successfully");
  });
  
  it("Retires credits successfully", async () => {
    // Create retirement account (burn account)
    retirementAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        projectOwner,
        tokenMint,
        program.programId,
        true // allowOwnerOffCurve
      )
    ).address;

    console.log("Retirement account created:", retirementAccount.toString());

    const amountToRetire = new anchor.BN(RETIREMENT_AMOUNT * (10 ** TOKEN_DECIMALS)); // 250 tokens
    
    const tx = await program.methods
      .retireCredits(amountToRetire)
      .accounts({
        fromAccount: investorTokenAccount,
        retirementAccount: retirementAccount,
        fromAuthority: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();
      
    console.log("Retire credits transaction signature:", tx);
      
    // Verify the retirement
    const retirementAccountInfo = await getAccount(provider.connection, retirementAccount);
    assert.equal(retirementAccountInfo.amount.toString(), amountToRetire.toString());
    
    console.log("✅ Credits retired successfully");
  });
});
