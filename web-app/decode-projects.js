const { Connection, PublicKey } = require('@solana/web3.js');

async function decodeProjectAccounts() {
  console.log('🔍 Decoding project accounts to find owner mappings...');
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr');
  
  try {
    // Get all program accounts
    const accounts = await connection.getProgramAccounts(programId);
    console.log('📊 Total accounts found:', accounts.length);
    
    accounts.forEach((account, i) => {
      console.log(`\n🔸 Account ${i + 1}:`);
      console.log('  📍 Account Address:', account.pubkey.toString());
      
      const data = account.account.data;
      
      // The data structure based on the Rust struct:
      // - 8 bytes: discriminator 
      // - 4 bytes: string length + project_id string
      // - 32 bytes: owner pubkey
      // - 4 bytes: string length + ipfs_cid string
      // - 8 bytes: carbon_tons_estimated (u64)
      // - 1 byte: verification_status (bool)
      // - 8 bytes: credits_issued (u64)  
      // - 8 bytes: tokens_minted (u64)
      // - 1 byte: bump
      
      if (data.length >= 40) {
        try {
          // Skip discriminator (8 bytes)
          let offset = 8;
          
          // Read project_id string (4 bytes length + string)
          const projectIdLength = data.readUInt32LE(offset);
          offset += 4;
          const projectId = data.slice(offset, offset + projectIdLength).toString('utf8');
          offset += projectIdLength;
          
          // Read owner pubkey (32 bytes)
          const ownerBytes = data.slice(offset, offset + 32);
          const owner = new PublicKey(ownerBytes);
          offset += 32;
          
          // Read ipfs_cid string (4 bytes length + string)
          const ipfsCidLength = data.readUInt32LE(offset);
          offset += 4;
          const ipfsCid = data.slice(offset, offset + ipfsCidLength).toString('utf8');
          offset += ipfsCidLength;
          
          // Read carbon_tons_estimated (8 bytes)
          const carbonTons = data.readBigUInt64LE(offset);
          offset += 8;
          
          // Read verification_status (1 byte)
          const verified = data.readUInt8(offset) === 1;
          offset += 1;
          
          // Read credits_issued (8 bytes)
          const creditsIssued = data.readBigUInt64LE(offset);
          offset += 8;
          
          // Read tokens_minted (8 bytes)  
          const tokensMinted = data.readBigUInt64LE(offset);
          
          console.log('  🏷️  Project ID:', projectId);
          console.log('  👤 Owner:', owner.toString());
          console.log('  📁 IPFS CID:', ipfsCid);
          console.log('  🌱 Carbon Tons:', carbonTons.toString());
          console.log('  ✅ Verified:', verified);
          console.log('  💰 Credits Issued:', creditsIssued.toString());
          console.log('  🪙 Tokens Minted:', tokensMinted.toString());
          
        } catch (error) {
          console.log('  ❌ Error decoding:', error.message);
          console.log('  📄 Raw data (first 64 bytes):', Buffer.from(data.slice(0, 64)).toString('hex'));
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

decodeProjectAccounts();