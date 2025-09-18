#!/usr/bin/env node

const { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } = require('@solana/spl-token');

// Program configuration
const PROGRAM_ID = new PublicKey('GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr');
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Admin keypair (you'll need to load your actual keypair)
const ADMIN_KEYPAIR = Keypair.generate(); // Replace with actual admin keypair

console.log('🔧 System Initialization Script');
console.log('==================================');

async function main() {
  try {
    console.log('📡 Connecting to Solana devnet...');
    const version = await connection.getVersion();
    console.log(`✅ Connected! Version: ${version['solana-core']}`);
    
    // Generate PDAs
    const [registryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('global_registry')],
      PROGRAM_ID
    );
    
    const [carbonMintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('carbon_token_mint')],
      PROGRAM_ID
    );
    
    const [mintAuthorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint_authority')],
      PROGRAM_ID
    );
    
    console.log('\n🔑 PDAs Generated:');
    console.log(`Registry PDA: ${registryPDA.toString()}`);
    console.log(`Carbon Mint PDA: ${carbonMintPDA.toString()}`);
    console.log(`Mint Authority PDA: ${mintAuthorityPDA.toString()}`);
    
    // Check admin wallet balance
    console.log('\n💰 Checking admin wallet...');
    console.log(`Admin wallet: ${ADMIN_KEYPAIR.publicKey.toString()}`);
    
    const balance = await connection.getBalance(ADMIN_KEYPAIR.publicKey);
    console.log(`Balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.1 * 1e9) {
      console.log('❌ Insufficient SOL balance. Please airdrop some SOL to the admin wallet:');
      console.log(`solana airdrop 2 ${ADMIN_KEYPAIR.publicKey.toString()} --url devnet`);
      return;
    }
    
    // Check if registry exists
    console.log('\n🔍 Checking system state...');
    const registryAccount = await connection.getAccountInfo(registryPDA);
    
    if (!registryAccount) {
      console.log('ℹ️ Registry not initialized. Ready for first initialization.');
      console.log('\n📋 Next steps:');
      console.log('1. Use the UI at http://localhost:3000/test');
      console.log('2. Connect your wallet (make sure it has some SOL)');
      console.log('3. Run the complete workflow test');
      console.log('4. The first step will initialize the registry');
    } else {
      console.log('✅ Registry already exists!');
      console.log('📊 Registry data length:', registryAccount.data.length);
      
      // Check token mint
      const mintAccount = await connection.getAccountInfo(carbonMintPDA);
      if (mintAccount) {
        console.log('✅ Carbon token mint exists!');
        console.log('📊 Mint data length:', mintAccount.data.length);
      }
    }
    
    console.log('\n🚀 System ready for testing!');
    console.log('Open http://localhost:3000/test to start testing');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}