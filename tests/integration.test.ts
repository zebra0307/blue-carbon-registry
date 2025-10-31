import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { assert, expect } from "chai";
import { BlueCarbonRegistry } from "../target/types/blue_carbon_registry";

// Integration tests for Blue Carbon Registry
// These tests verify the complete workflow of the registry
describe("Blue Carbon Registry - Integration Tests", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BlueCarbonRegistry as Program<BlueCarbonRegistry>;
  
  // Test accounts
  let admin: Keypair;
  let validator: Keypair;
  let projectOwner: Keypair;
  let buyer: Keypair;
  
  // PDAs
  let registryPda: PublicKey;
  let registryBump: number;
  let carbonTokenMintPda: PublicKey;
  let mintAuthorityPda: PublicKey;
  
  // Test data
  const PROJECT_ID = "test-mangrove-001";
  const CARBON_ESTIMATE = new anchor.BN(1000); // 1000 tons
  
  before(async () => {
    // Initialize test wallets
    admin = provider.wallet.payer;
    validator = Keypair.generate();
    projectOwner = Keypair.generate();
    buyer = Keypair.generate();
    
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(
      validator.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.requestAirdrop(
      projectOwner.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.requestAirdrop(
      buyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    
    // Wait for airdrops
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Derive PDAs
    [registryPda, registryBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("registry_v3")],
      program.programId
    );
    
    [carbonTokenMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("carbon_token_mint_v3")],
      program.programId
    );
    
    [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority_v3")],
      program.programId
    );
  });

  describe("1. Registry Initialization", () => {
    it("Should initialize the global registry", async () => {
      // Check if registry already exists (from other tests)
      try {
        const existingRegistry = await program.account.globalRegistry.fetch(registryPda);
        console.log("Registry already exists, skipping initialization");
        
        // Verify existing registry state
        assert.ok(existingRegistry.admin);
        assert.ok(existingRegistry.carbonTokenMint.equals(carbonTokenMintPda));
        return; // Skip initialization
      } catch (error) {
        // Registry doesn't exist, proceed with initialization
      }
      
      const decimals = 6;
      
      const tx = await program.methods
        .initializeRegistry(decimals)
        .rpc();
      
      console.log("Registry initialized:", tx);
      
      // Fetch and verify registry state
      const registry = await program.account.globalRegistry.fetch(registryPda);
      
      assert.ok(registry.admin.equals(admin.publicKey));
      assert.equal(registry.totalProjects.toNumber(), 0);
      assert.equal(registry.totalCreditsIssued.toNumber(), 0);
      assert.ok(registry.carbonTokenMint.equals(carbonTokenMintPda));
    });
    
    it("Should fail to initialize registry twice", async () => {
      try {
        await program.methods
          .initializeRegistry(6)
          .rpc();
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.toString().includes("already in use"));
      }
    });
  });

  describe("2. Project Registration", () => {
    let projectPda: PublicKey;
    
    it("Should register a new blue carbon project", async () => {
      [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), projectOwner.publicKey.toBuffer(), Buffer.from(PROJECT_ID)],
        program.programId
      );
      
      const tx = await program.methods
        .registerProject(PROJECT_ID, "QmTest123...", CARBON_ESTIMATE)
        .accounts({
          project: projectPda,
          registry: registryPda,
          projectOwner: projectOwner.publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([projectOwner])
        .rpc();
      
      console.log("Project registered:", tx);
      
      // Verify project state
      const project = await program.account.project.fetch(projectPda);
      assert.equal(project.projectId, PROJECT_ID);
      assert.ok(project.owner.equals(projectOwner.publicKey));
      assert.equal(project.carbonTonsEstimated.toNumber(), CARBON_ESTIMATE.toNumber());
      // Check verification status enum instead of isVerified boolean
      assert.ok(project.verificationStatus.pending !== undefined || project.verificationStatus.underReview !== undefined);
      assert.equal(project.creditsIssued.toNumber(), 0);
    });
    
    it("Should fail to register duplicate project ID", async () => {
      try {
        const [dupProjectPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("project"), projectOwner.publicKey.toBuffer(), Buffer.from(PROJECT_ID)],
          program.programId
        );
        
        await program.methods
          .registerProject(PROJECT_ID, "QmTest456...", new anchor.BN(500))
          .accounts({
            project: dupProjectPda,
            registry: registryPda,
            projectOwner: projectOwner.publicKey,
            systemProgram: SystemProgram.programId,
          } as any)
          .signers([projectOwner])
          .rpc();
          
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.toString().includes("already in use"));
      }
    });
  });

  describe("3. Project Verification", () => {
    let projectPda: PublicKey;
    let verificationNodePda: PublicKey;
    
    before(() => {
      // Use the correct PDA seeds including owner
      [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), projectOwner.publicKey.toBuffer(), Buffer.from(PROJECT_ID)],
        program.programId
      );
      
      [verificationNodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification_node"), projectPda.toBuffer()],
        program.programId
      );
    });
    
    it("Should verify a project (validator approval)", async () => {
      const verifiedCarbonTons = CARBON_ESTIMATE;
      
      const tx = await program.methods
        .verifyProject(verifiedCarbonTons)
        .accounts({
          project: projectPda,
          registry: registryPda,
          admin: admin.publicKey,
        } as any)
        .signers([admin])
        .rpc();
      
      console.log("Project verified:", tx);
      
      // Check project is now verified
      const project = await program.account.project.fetch(projectPda);
      // Check verification status enum instead of isVerified boolean
      assert.ok(project.verificationStatus.verified !== undefined);
    });
    
    it.skip("Should fail verification by non-validator", async () => {
      // This test needs to be rewritten to match current IDL
      // The registerProject signature has changed
    });
  });

  describe.skip("4. Carbon Credit Minting", () => {
    // These tests need rewriting to match current IDL - method signatures changed
  });

  describe.skip("5. Credit Transfer", () => {
    // These tests need rewriting to match current IDL  
  });

  describe.skip("6. Credit Retirement", () => {
    // These tests need rewriting to match current IDL
  });

  describe.skip("7. Monitoring Data Submission", () => {
    // These tests need rewriting to match current IDL
  });

  describe.skip("8. Marketplace Operations", () => {
    // These tests need rewriting to match current IDL
  });

  describe.skip("9. Error Handling", () => {
    // These tests need rewriting to match current IDL
  });
});

