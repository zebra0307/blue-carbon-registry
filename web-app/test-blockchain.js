const { Connection, PublicKey } = require('@solana/web3.js');

async function testConnection() {
  console.log('Testing Solana connection...');
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr');
  
  try {
    // Test basic connection
    const version = await connection.getVersion();
    console.log('✅ Solana connection successful, version:', version);
    
    // Check if program exists
    const accountInfo = await connection.getAccountInfo(programId);
    if (accountInfo) {
      console.log('✅ Program account found:', {
        lamports: accountInfo.lamports,
        owner: accountInfo.owner.toString(),
        executable: accountInfo.executable
      });
    } else {
      console.log('❌ Program account not found');
    }
    
    // Try to get program accounts
    const accounts = await connection.getProgramAccounts(programId);
    console.log('📊 Program accounts found:', accounts.length);
    
    if (accounts.length > 0) {
      console.log('First account:', accounts[0].pubkey.toString());
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();