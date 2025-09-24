const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');

// Mock wallet for initialization
const mockWallet = {
  publicKey: null,
  connected: true,
  signTransaction: async (tx) => tx,
  signAllTransactions: async (txs) => txs
};

async function initializeIfNeeded() {
  console.log('🚀 Checking if registry needs initialization...');
  
  try {
    // Load the wallet keypair
    const keypairData = JSON.parse(fs.readFileSync('/home/rammsey/.config/solana/id.json'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    mockWallet.publicKey = keypair.publicKey;
    console.log('Admin wallet:', keypair.publicKey.toString());
    
    // Try to check registry status
    // For now, let's just fetch the accounts to see what exists
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const programId = new PublicKey('GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr');
    
    const accounts = await connection.getProgramAccounts(programId);
    console.log('📊 Found', accounts.length, 'accounts');
    
    accounts.forEach((account, i) => {
      console.log(`Account ${i + 1}:`, account.pubkey.toString());
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

initializeIfNeeded();