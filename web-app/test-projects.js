const { Connection, PublicKey } = require('@solana/web3.js');

async function testProjects() {
  console.log('🧪 Testing project accounts...');
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr');
  
  try {
    // Get all program accounts
    const accounts = await connection.getProgramAccounts(programId);
    console.log('📊 Total accounts:', accounts.length);
    
    // Try to decode the data for each account
    accounts.forEach((account, i) => {
      console.log(`\nAccount ${i + 1}:`);
      console.log('  Address:', account.pubkey.toString());
      console.log('  Data length:', account.account.data.length);
      console.log('  Owner:', account.account.owner.toString());
      
      // Try to read the first few bytes to see the structure
      const data = account.account.data;
      if (data.length > 8) {
        console.log('  First 32 bytes:', Buffer.from(data.slice(0, 32)).toString('hex'));
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProjects();