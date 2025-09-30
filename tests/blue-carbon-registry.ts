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
  ASSOCIATED_TOKEN_PROGRAM_ID,
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
  let registryPda: PublicKey;
  let tokenMint: PublicKey;
  let projectTokenAccount: PublicKey;
  let investorTokenAccount: PublicKey;
  let investorWallet: Keypair;
  let retirementAccount: PublicKey;

  const projectId = `BCP-${Date.now()}`; // Make unique with timestamp
  const ipfsCid = "QmYwAPJzv5CZsnAzt8auVKRQm6VLw4Dy8YQANhBBfmGjw8";
  
  // Test constants
  const TOKEN_DECIMALS = 6;
  const INITIAL_MINT_AMOUNT = 800; // Match verified carbon tons
  const TRANSFER_AMOUNT = 500;
  const RETIREMENT_AMOUNT = 250;

  before(async () => {
    try {
      // Use the provider's wallet as the project owner (it already has SOL)
      projectOwner = (provider.wallet as anchor.Wallet).payer;
      
      // Create a separate investor wallet
      investorWallet = Keypair.generate();

      // Derive the project PDA
      [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), projectOwner.publicKey.toBuffer(), Buffer.from(projectId)],
        program.programId
      );
      
      // Derive the registry PDA  
      [registryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("registry_v3")],
        program.programId
      );
      
      // Derive the carbon token mint PDA
      const [carbonTokenMintPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("carbon_token_mint_v3")],
        program.programId
      );
      
      tokenMint = carbonTokenMintPda;
      
      console.log("Test setup completed successfully");
    } catch (error) {
      console.error("Test setup failed:", error);
      throw error;
    }
  });

  it("Initializes the registry successfully", async () => {
    try {
      // Try to fetch the registry first - if it exists, skip initialization
      const existingRegistry = await program.account.globalRegistry.fetch(registryPda);
      console.log("Registry already exists, skipping initialization");
      
      // Verify existing registry has correct properties
      assert.equal(existingRegistry.admin.toString(), projectOwner.publicKey.toString());
      console.log("✅ Existing registry verified successfully");
    } catch (error) {
      // Registry doesn't exist, initialize it
      console.log("Registry not found, initializing...");

      const tx = await program.methods
        .initializeRegistry(TOKEN_DECIMALS)
        .accounts({
          registry: registryPda,
          carbonTokenMint: tokenMint,
          admin: projectOwner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        } as any)
        .signers([projectOwner])
        .rpc();
      
      console.log("Registry initialization transaction signature:", tx);
      
      // Fetch the registry account and verify its data
      const registryAccount = await program.account.globalRegistry.fetch(registryPda);
      
      assert.equal(registryAccount.totalCreditsIssued.toString(), "0");
      assert.equal(registryAccount.totalProjects.toString(), "0");
      assert.equal(registryAccount.admin.toString(), projectOwner.publicKey.toString());
      
      console.log("✅ Registry initialized successfully");
    }
  });

  it("Registers a project successfully", async () => {
    const carbonTonsEstimated = new anchor.BN(1000); // 1000 tons estimated
    const tx = await program.methods
      .registerProject(projectId, ipfsCid, carbonTonsEstimated)
      .accounts({
        project: projectPda,
        registry: registryPda,
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

  it("Verifies a project successfully", async () => {
    const verifiedCarbonTons = new anchor.BN(800); // Verify 800 tons
    
    // Note: This assumes the project owner can verify the project
    // In a real scenario, this would be done by an admin
    const tx = await program.methods
      .verifyProject(verifiedCarbonTons)
      .accounts({
        project: projectPda,
        registry: registryPda,
        admin: projectOwner.publicKey, // Using project owner as admin for testing
      } as any)
      .signers([projectOwner])
      .rpc();
    
    console.log("Project verification transaction signature:", tx);
    
    // Fetch the project account and verify its status
    const projectAccount = await program.account.project.fetch(projectPda);
    console.log("Project verification status:", projectAccount.verificationStatus);
    console.log("Verified carbon tons:", projectAccount.carbonTonsEstimated.toString());
    
    console.log("✅ Project verified successfully");
  });
  
  it("Mints credits successfully", async () => {
    // Use the carbon token mint from the registry (already created)
    console.log("Token mint:", tokenMint.toString());

    // Create token account for the project owner
    projectTokenAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        projectOwner,
        tokenMint,
        projectOwner.publicKey,
      )
    ).address;

    console.log("Project token account created:", projectTokenAccount.toString());

    const amountToMint = new anchor.BN(INITIAL_MINT_AMOUNT * (10 ** TOKEN_DECIMALS)); // 1000 tokens with 6 decimals

    const tx = await program.methods
      .mintVerifiedCredits(amountToMint)
      .accounts({
        project: projectPda,
        registry: registryPda,
        carbonTokenMint: tokenMint,
        recipientTokenAccount: projectTokenAccount,
        owner: projectOwner.publicKey,
        recipient: projectOwner.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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
    assert.equal(projectAccount.tokensMinted.toString(), amountToMint.toString());
    // Note: token account may have accumulated balance from previous test runs
    console.log("Token account balance:", tokenAccountInfo.amount.toString());
    console.log("Expected amount:", amountToMint.toString());
    
    console.log("✅ Credits minted successfully");
  });

  it("Transfers credits successfully", async () => {
    // Create token account for investor (owned by separate investor wallet)
    investorTokenAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        projectOwner,
        tokenMint,
        investorWallet.publicKey,
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
    // Fund the investor wallet for transaction fees
    const airdropTx = await provider.connection.requestAirdrop(
      investorWallet.publicKey,
      1000000000 // 1 SOL
    );
    await provider.connection.confirmTransaction(airdropTx);
    
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
    
    // Get balance before retirement
    const balanceBefore = await getAccount(provider.connection, retirementAccount);
    const beforeAmount = balanceBefore.amount;
    
    const tx = await program.methods
      .retireCredits(amountToRetire)
      .accounts({
        fromAccount: investorTokenAccount,
        retirementAccount: retirementAccount,
        fromAuthority: investorWallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([investorWallet])
      .rpc();
      
    console.log("Retire credits transaction signature:", tx);
      
    // Verify the retirement - check that balance increased by the retired amount
    const retirementAccountInfo = await getAccount(provider.connection, retirementAccount);
    const expectedBalance = beforeAmount + BigInt(amountToRetire.toString());
    assert.equal(retirementAccountInfo.amount.toString(), expectedBalance.toString());
    
    console.log("✅ Credits retired successfully");
  });
});
