import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { assert, expect } from "chai";
import { BlueCarbonRegistry } from "../target/types/blue_carbon_registry";

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
        [Buffer.from("project"), Buffer.from(PROJECT_ID)],
        program.programId
      );
      
      const projectData = {
        projectId: PROJECT_ID,
        ipfsCid: "QmTest123...",
        carbonTonsEstimated: CARBON_ESTIMATE,
        projectType: { mangrovesRestoration: {} },
        location: {
          latitude: 1.2345,
          longitude: 103.8567,
          country: "Indonesia",
          region: "Sumatra",
        },
        areaHectares: 100.0,
        ecosystemType: { mangroves: {} },
        startDate: new anchor.BN(Date.now() / 1000),
        duration: new anchor.BN(365 * 10), // 10 years in days
        communityBeneficiaries: new anchor.BN(500),
        jobsCreated: new anchor.BN(25),
        additionalDocuments: [],
        methodologyUsed: "VM0033",
        baselineScenario: "Deforestation baseline",
        monitoringPlan: "Annual satellite + field surveys",
        stakeholderConsent: true,
        indigenousLandRights: true,
      };
      
      const tx = await program.methods
        .registerProject(projectData)
        .accounts({
          owner: projectOwner.publicKey,
        })
        .signers([projectOwner])
        .rpc();
      
      console.log("Project registered:", tx);
      
      // Verify project state
      const project = await program.account.project.fetch(projectPda);
      assert.equal(project.projectId, PROJECT_ID);
      assert.ok(project.owner.equals(projectOwner.publicKey));
      assert.equal(project.carbonTonsEstimated.toNumber(), CARBON_ESTIMATE.toNumber());
      assert.equal(project.isVerified, false);
      assert.equal(project.creditsMinted.toNumber(), 0);
    });
    
    it("Should fail to register duplicate project ID", async () => {
      try {
        const projectData = {
          projectId: PROJECT_ID, // Same ID
          ipfsCid: "QmTest456...",
          carbonTonsEstimated: new anchor.BN(500),
          projectType: { seagrassConservation: {} },
          location: {
            latitude: 2.0,
            longitude: 104.0,
            country: "Malaysia",
            region: "Johor",
          },
          areaHectares: 50.0,
          ecosystemType: { seagrass: {} },
          startDate: new anchor.BN(Date.now() / 1000),
          duration: new anchor.BN(365 * 5),
          communityBeneficiaries: new anchor.BN(200),
          jobsCreated: new anchor.BN(10),
          additionalDocuments: [],
          methodologyUsed: "VM0033",
          baselineScenario: "Test",
          monitoringPlan: "Test",
          stakeholderConsent: true,
          indigenousLandRights: false,
        };
        
        await program.methods
          .registerProject(projectData)
          .accounts({
            owner: projectOwner.publicKey,
          })
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
      [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), Buffer.from(PROJECT_ID)],
        program.programId
      );
      
      [verificationNodePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification_node"), projectPda.toBuffer()],
        program.programId
      );
    });
    
    it("Should verify a project (validator approval)", async () => {
      const verificationReportCid = "QmVerificationReport123...";
      const carbonEstimate = CARBON_ESTIMATE;
      const approved = true;
      
      const tx = await program.methods
        .verifyProject(verificationReportCid, carbonEstimate, approved)
        .accounts({
          validator: validator.publicKey,
        })
        .signers([validator])
        .rpc();
      
      console.log("Project verified:", tx);
      
      // Check project is now verified
      const project = await program.account.project.fetch(projectPda);
      assert.equal(project.isVerified, true);
      
      // Check verification node exists
      const verificationNode = await program.account.verificationNode.fetch(verificationNodePda);
      assert.ok(verificationNode.validatedBy.length > 0);
    });
    
    it("Should fail verification by non-validator", async () => {
      const [newProjectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), Buffer.from("test-project-002")],
        program.programId
      );
      
      // First register a new project
      const projectData = {
        projectId: "test-project-002",
        ipfsCid: "QmTest789...",
        carbonTonsEstimated: new anchor.BN(800),
        projectType: { saltMarshRestoration: {} },
        location: {
          latitude: 40.0,
          longitude: -74.0,
          country: "USA",
          region: "New Jersey",
        },
        areaHectares: 75.0,
        ecosystemType: { saltMarsh: {} },
        startDate: new anchor.BN(Date.now() / 1000),
        duration: new anchor.BN(365 * 7),
        communityBeneficiaries: new anchor.BN(300),
        jobsCreated: new anchor.BN(15),
        additionalDocuments: [],
        methodologyUsed: "VM0033",
        baselineScenario: "Test",
        monitoringPlan: "Test",
        stakeholderConsent: true,
        indigenousLandRights: true,
      };
      
      await program.methods
        .registerProject(projectData)
        .accounts({
          owner: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();
      
      // Try to verify with non-validator (buyer)
      try {
        await program.methods
          .verifyProject("QmFakeReport...", new anchor.BN(800), true)
          .accounts({
            validator: buyer.publicKey,
          })
          .signers([buyer])
          .rpc();
          
        assert.fail("Should have thrown error");
      } catch (error: any) {
        // Expected error - only validators can verify
        assert.ok(error.toString().includes("validator") || error.toString().includes("unauthorized"));
      }
    });
  });

  describe("4. Carbon Credit Minting", () => {
    let projectPda: PublicKey;
    let projectOwnerTokenAccount: PublicKey;
    
    before(async () => {
      [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), Buffer.from(PROJECT_ID)],
        program.programId
      );
      
      projectOwnerTokenAccount = await getAssociatedTokenAddress(
        carbonTokenMintPda,
        projectOwner.publicKey
      );
    });
    
    it("Should mint credits for verified project", async () => {
      const tx = await program.methods
        .mintVerifiedCredits(CARBON_ESTIMATE)
        .accounts({
          projectOwner: projectOwner.publicKey,
        })
        .signers([projectOwner])
        .rpc();
      
      console.log("Credits minted:", tx);
      
      // Verify project credits_minted updated
      const project = await program.account.project.fetch(projectPda);
      assert.equal(project.creditsMinted.toNumber(), CARBON_ESTIMATE.toNumber());
      
      // Verify registry total_credits_issued updated
      const registry = await program.account.globalRegistry.fetch(registryPda);
      assert.ok(registry.totalCreditsIssued.toNumber() >= CARBON_ESTIMATE.toNumber());
    });
    
    it("Should fail to mint credits for unverified project", async () => {
      // Register unverified project
      const unverifiedProjectId = "test-unverified-001";
      const projectData = {
        projectId: unverifiedProjectId,
        ipfsCid: "QmUnverified...",
        carbonTonsEstimated: new anchor.BN(500),
        projectType: { kelpForestRestoration: {} },
        location: {
          latitude: 36.0,
          longitude: -122.0,
          country: "USA",
          region: "California",
        },
        areaHectares: 60.0,
        ecosystemType: { kelpForests: {} },
        startDate: new anchor.BN(Date.now() / 1000),
        duration: new anchor.BN(365 * 5),
        communityBeneficiaries: new anchor.BN(100),
        jobsCreated: new anchor.BN(8),
        additionalDocuments: [],
        methodologyUsed: "VM0033",
        baselineScenario: "Test",
        monitoringPlan: "Test",
        stakeholderConsent: true,
        indigenousLandRights: false,
      };
      
      await program.methods
        .registerProject(projectData)
        .accounts({
          owner: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();
      
      // Try to mint without verification
      try {
        await program.methods
          .mintVerifiedCredits(new anchor.BN(500))
          .accounts({
            projectOwner: buyer.publicKey,
          })
          .signers([buyer])
          .rpc();
          
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.toString().includes("verified") || error.toString().includes("CannotMintUnverifiedProject"));
      }
    });
  });

  describe("5. Credit Transfer", () => {
    let senderTokenAccount: PublicKey;
    let receiverTokenAccount: PublicKey;
    
    before(async () => {
      senderTokenAccount = await getAssociatedTokenAddress(
        carbonTokenMintPda,
        projectOwner.publicKey
      );
      
      receiverTokenAccount = await getAssociatedTokenAddress(
        carbonTokenMintPda,
        buyer.publicKey
      );
    });
    
    it("Should transfer credits between accounts", async () => {
      const transferAmount = new anchor.BN(100);
      
      const tx = await program.methods
        .transferCredits(transferAmount)
        .accounts({
          from: projectOwner.publicKey,
          to: buyer.publicKey,
        })
        .signers([projectOwner])
        .rpc();
      
      console.log("Credits transferred:", tx);
      
      // Verify balances (would need to check token accounts)
      // This is a simplified check
      assert.ok(tx);
    });
  });

  describe("6. Credit Retirement", () => {
    it("Should retire (burn) carbon credits", async () => {
      const retireAmount = new anchor.BN(50);
      
      const tx = await program.methods
        .retireCredits(retireAmount)
        .accounts({
          owner: buyer.publicKey,
        })
        .signers([buyer])
        .rpc();
      
      console.log("Credits retired:", tx);
      
      // Credits should be permanently removed from circulation
      assert.ok(tx);
    });
  });

  describe("7. Monitoring Data Submission", () => {
    let projectPda: PublicKey;
    let monitoringDataPda: PublicKey;
    
    before(() => {
      [projectPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), Buffer.from(PROJECT_ID)],
        program.programId
      );
      
      const timestamp = Math.floor(Date.now() / 1000);
      const timestampBuf = Buffer.alloc(8);
      timestampBuf.writeBigInt64LE(BigInt(timestamp));
      
      [monitoringDataPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("monitoring_data"), projectPda.toBuffer(), timestampBuf],
        program.programId
      );
    });
    
    it("Should submit monitoring data", async () => {
      const monitoringData = {
        biomassDensity: 15.5,
        canopyCover: 85.0,
        co2Sequestration: 25.3,
        waterQuality: {
          phLevel: 7.8,
          salinity: 35.0,
          dissolvedOxygen: 6.5,
          turbidity: 2.1,
          nutrients: {
            nitrogen: 1.2,
            phosphorus: 0.3,
            potassium: 0.5,
          },
        },
        documentCids: ["QmMonitoring1...", "QmMonitoring2..."],
        notes: "Regular monitoring - all indicators healthy",
      };
      
      const tx = await program.methods
        .submitMonitoringData(monitoringData)
        .accounts({
          submitter: validator.publicKey,
        })
        .signers([validator])
        .rpc();
      
      console.log("Monitoring data submitted:", tx);
      assert.ok(tx);
    });
  });

  describe("8. Marketplace Operations", () => {
    it("Should create marketplace listing", async () => {
      const listingId = "listing-001";
      const pricePerCredit = new anchor.BN(1000000); // 0.001 SOL per credit
      const quantity = new anchor.BN(200);
      
      const [listingPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("listing"), Buffer.from(PROJECT_ID), projectOwner.publicKey.toBuffer()],
        program.programId
      );
      
      const tx = await program.methods
        .createMarketplaceListing(PROJECT_ID, quantity, pricePerCredit)
        .accounts({
          seller: projectOwner.publicKey,
        })
        .signers([projectOwner])
        .rpc();
      
      console.log("Marketplace listing created:", tx);
      assert.ok(tx);
    });
    
    it("Should purchase credits from marketplace", async () => {
      const quantity = new anchor.BN(50);
      
      const tx = await program.methods
        .purchaseCredits(PROJECT_ID, quantity)
        .accounts({
          buyer: buyer.publicKey,
          seller: projectOwner.publicKey,
        })
        .signers([buyer])
        .rpc();
      
      console.log("Credits purchased:", tx);
      assert.ok(tx);
    });
  });

  describe("9. Error Handling", () => {
    it("Should handle insufficient credits error", async () => {
      try {
        // Try to transfer more credits than available
        await program.methods
          .transferCredits(new anchor.BN(999999999))
          .accounts({
            from: buyer.publicKey,
            to: projectOwner.publicKey,
          })
          .signers([buyer])
          .rpc();
          
        assert.fail("Should have thrown error");
      } catch (error: any) {
        assert.ok(error.toString().includes("insufficient") || error.toString().includes("InsufficientCredits"));
      }
    });
  });
});
