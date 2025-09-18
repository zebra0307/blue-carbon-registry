/**
 * Complete Token Workflow Test
 * 
 * This script tests the end-to-end workflow:
 * 1. Initialize registry (admin only)
 * 2. Register project with carbon ton estimates
 * 3. Verify project (admin only)
 * 4. Mint carbon credit tokens for verified project
 * 5. Check token balances
 * 6. Transfer tokens between wallets
 * 7. Validate all operations
 */

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { 
  initializeSolana,
  initializeRegistry,
  registerProjectEnhanced,
  verifyProject,
  mintVerifiedCredits,
  getCarbonTokenBalance,
  transferCredits,
  getGlobalRegistryData,
  getProjectData,
  getGlobalRegistryPDA,
  getCarbonTokenMintPDA,
  getRegistryMintAuthorityPDA,
  getProjectPDA
} from '../utils/solana';

interface TestWallet {
  publicKey: PublicKey;
  keypair: Keypair;
  connected: boolean;
  signTransaction: (tx: any) => Promise<any>;
  signAllTransactions: (txs: any[]) => Promise<any[]>;
}

class TokenWorkflowTester {
  private adminWallet: TestWallet;
  private projectOwnerWallet: TestWallet;
  private recipientWallet: TestWallet;
  private connection: Connection;

  constructor() {
    // Create test wallets
    this.adminWallet = this.createTestWallet();
    this.projectOwnerWallet = this.createTestWallet();
    this.recipientWallet = this.createTestWallet();
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  }

  private createTestWallet(): TestWallet {
    const keypair = Keypair.generate();
    return {
      publicKey: keypair.publicKey,
      keypair,
      connected: true,
      signTransaction: async (tx) => {
        tx.partialSign(keypair);
        return tx;
      },
      signAllTransactions: async (txs) => {
        return txs.map(tx => {
          tx.partialSign(keypair);
          return tx;
        });
      }
    };
  }

  private async fundWallet(wallet: TestWallet, amount: number = 2) {
    try {
      console.log(`🏦 Requesting ${amount} SOL airdrop for wallet: ${wallet.publicKey.toString()}`);
      
      const signature = await this.connection.requestAirdrop(
        wallet.publicKey,
        amount * 1e9 // Convert SOL to lamports
      );
      
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      const balance = await this.connection.getBalance(wallet.publicKey);
      console.log(`✅ Wallet funded! Balance: ${balance / 1e9} SOL`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to fund wallet:', error);
      return false;
    }
  }

  async runCompleteTest() {
    console.log('🚀 Starting Complete Token Workflow Test...\n');

    try {
      // Step 1: Fund wallets
      console.log('=== STEP 1: Fund Test Wallets ===');
      await this.fundWallet(this.adminWallet);
      await this.fundWallet(this.projectOwnerWallet);
      await this.fundWallet(this.recipientWallet, 1); // Less SOL for recipient
      
      // Wait a bit for funding to settle
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: Initialize Registry
      console.log('\n=== STEP 2: Initialize Global Registry ===');
      await this.testInitializeRegistry();

      // Step 3: Register Project
      console.log('\n=== STEP 3: Register Carbon Project ===');
      const projectId = await this.testRegisterProject();

      // Step 4: Verify Project
      console.log('\n=== STEP 4: Verify Project (Admin) ===');
      await this.testVerifyProject(projectId);

      // Step 5: Mint Tokens
      console.log('\n=== STEP 5: Mint Carbon Credit Tokens ===');
      await this.testMintTokens(projectId);

      // Step 6: Check Balances
      console.log('\n=== STEP 6: Check Token Balances ===');
      await this.testCheckBalances();

      // Step 7: Transfer Tokens
      console.log('\n=== STEP 7: Transfer Tokens ===');
      await this.testTransferTokens();

      // Step 8: Final Verification
      console.log('\n=== STEP 8: Final System State ===');
      await this.testFinalState();

      console.log('\n🎉 Complete Token Workflow Test PASSED! 🎉');
      
    } catch (error) {
      console.error('\n❌ Complete Token Workflow Test FAILED:', error);
      throw error;
    }
  }

  private async testInitializeRegistry() {
    try {
      console.log('Admin wallet:', this.adminWallet.publicKey.toString());
      
      const result = await initializeRegistry(this.adminWallet);
      
      if (result.success) {
        console.log('✅ Registry initialized successfully!');
        console.log('Transaction:', result.transaction);
      } else {
        console.log('ℹ️ Registry may already be initialized:', result.error);
      }

      // Verify registry data
      const registryData = await getGlobalRegistryData(this.adminWallet);
      if (registryData.success) {
        console.log('✅ Registry data verified:', registryData.data);
      }

    } catch (error) {
      console.error('❌ Registry initialization failed:', error);
      throw error;
    }
  }

  private async testRegisterProject(): Promise<string> {
    try {
      const projectId = `test-project-${Date.now()}`;
      const ipfsCid = 'QmTestCarbonProjectHash123456789';
      const carbonTonsEstimated = 1000; // 1000 tons CO2

      console.log('Project details:', {
        projectId,
        owner: this.projectOwnerWallet.publicKey.toString(),
        carbonTonsEstimated
      });

      const result = await registerProjectEnhanced(
        this.projectOwnerWallet,
        projectId,
        ipfsCid,
        carbonTonsEstimated
      );

      if (result.success) {
        console.log('✅ Project registered successfully!');
        console.log('Transaction:', result.transaction);
        console.log('Project PDA:', result.projectPDA?.toString());
        return projectId;
      } else {
        throw new Error(`Project registration failed: ${result.error}`);
      }

    } catch (error) {
      console.error('❌ Project registration failed:', error);
      throw error;
    }
  }

  private async testVerifyProject(projectId: string) {
    try {
      const verifiedCarbonTons = 800; // Verify 800 tons (less than estimated)

      console.log('Verifying project:', {
        projectId,
        projectOwner: this.projectOwnerWallet.publicKey.toString(),
        verifiedCarbonTons
      });

      const result = await verifyProject(
        this.adminWallet,
        this.projectOwnerWallet.publicKey,
        projectId,
        verifiedCarbonTons
      );

      if (result.success) {
        console.log('✅ Project verified successfully!');
        console.log('Transaction:', result.transaction);

        // Check project data
        const projectData = await getProjectData(
          this.adminWallet,
          this.projectOwnerWallet.publicKey,
          projectId
        );
        
        if (projectData.success) {
          console.log('✅ Project data updated:', projectData.data);
        }
      } else {
        throw new Error(`Project verification failed: ${result.error}`);
      }

    } catch (error) {
      console.error('❌ Project verification failed:', error);
      throw error;
    }
  }

  private async testMintTokens(projectId: string) {
    try {
      const tokensToMint = 500; // Mint 500 tokens (less than verified capacity)

      console.log('Minting tokens:', {
        projectId,
        amount: tokensToMint,
        recipient: this.recipientWallet.publicKey.toString()
      });

      const result = await mintVerifiedCredits(
        this.projectOwnerWallet,
        projectId,
        tokensToMint,
        this.recipientWallet.publicKey
      );

      if (result.success) {
        console.log('✅ Tokens minted successfully!');
        console.log('Transaction:', result.transaction);
        console.log('Token Account:', result.tokenAccount?.toString());
      } else {
        throw new Error(`Token minting failed: ${result.error}`);
      }

    } catch (error) {
      console.error('❌ Token minting failed:', error);
      throw error;
    }
  }

  private async testCheckBalances() {
    try {
      console.log('Checking token balances...');

      // Check recipient balance
      const recipientBalance = await getCarbonTokenBalance(
        this.recipientWallet,
        this.recipientWallet.publicKey
      );

      // Check project owner balance
      const ownerBalance = await getCarbonTokenBalance(
        this.projectOwnerWallet,
        this.projectOwnerWallet.publicKey
      );

      console.log('✅ Token Balances:');
      console.log(`  Recipient: ${recipientBalance.balance || 0} tokens`);
      console.log(`  Project Owner: ${ownerBalance.balance || 0} tokens`);

      if ((recipientBalance.balance || 0) > 0) {
        console.log('✅ Token minting verified - recipient has tokens!');
      }

    } catch (error) {
      console.error('❌ Balance check failed:', error);
      throw error;
    }
  }

  private async testTransferTokens() {
    try {
      const transferAmount = 100; // Transfer 100 tokens

      console.log('Transferring tokens:', {
        from: this.recipientWallet.publicKey.toString(),
        to: this.projectOwnerWallet.publicKey.toString(),
        amount: transferAmount
      });

      const result = await transferCredits(
        this.recipientWallet,
        transferAmount,
        this.projectOwnerWallet.publicKey
      );

      if (result.success) {
        console.log('✅ Tokens transferred successfully!');
        console.log('Transaction:', result.transaction);

        // Verify balances after transfer
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.testCheckBalances();
      } else {
        throw new Error(`Token transfer failed: ${result.error}`);
      }

    } catch (error) {
      console.error('❌ Token transfer failed:', error);
      throw error;
    }
  }

  private async testFinalState() {
    try {
      console.log('Checking final system state...');

      // Get global registry data
      const registryData = await getGlobalRegistryData(this.adminWallet);
      if (registryData.success) {
        console.log('✅ Final Registry State:', registryData.data);
      }

      // Print wallet addresses for reference
      console.log('📋 Test Wallet Addresses:');
      console.log(`  Admin: ${this.adminWallet.publicKey.toString()}`);
      console.log(`  Project Owner: ${this.projectOwnerWallet.publicKey.toString()}`);
      console.log(`  Recipient: ${this.recipientWallet.publicKey.toString()}`);

      // Print PDA addresses
      const [registryPDA] = getGlobalRegistryPDA();
      const [carbonMintPDA] = getCarbonTokenMintPDA();
      const [mintAuthorityPDA] = getRegistryMintAuthorityPDA();

      console.log('📋 System PDA Addresses:');
      console.log(`  Registry: ${registryPDA.toString()}`);
      console.log(`  Carbon Token Mint: ${carbonMintPDA.toString()}`);
      console.log(`  Mint Authority: ${mintAuthorityPDA.toString()}`);

    } catch (error) {
      console.error('❌ Final state check failed:', error);
      throw error;
    }
  }
}

// Export for testing
export default TokenWorkflowTester;

// For direct execution
if (typeof window === 'undefined') {
  // Running in Node.js environment
  console.log('Token Workflow Tester ready for execution');
}