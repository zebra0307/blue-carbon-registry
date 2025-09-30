import { PublicKey } from '@solana/web3.js';
import { initializeSolana, getGlobalRegistryPDA, initializeRegistry } from './solana';

/**
 * Check if the global registry exists and initialize if needed
 */
export async function ensureRegistryExists(wallet: any): Promise<{ exists: boolean; initialized?: boolean; error?: string }> {
  try {
    if (!wallet?.connected) {
      return { exists: false, error: 'Wallet not connected' };
    }

    const { connection, program } = initializeSolana(wallet);
    if (!program) {
      return { exists: false, error: 'Failed to initialize Solana program' };
    }

    const [registryPDA] = getGlobalRegistryPDA();
    console.log('🔍 Checking registry PDA:', registryPDA.toString());
    console.log('🔍 Using program ID:', program.programId.toString());
    
    try {
      // Check if account exists first
      const accountInfo = await connection.getAccountInfo(registryPDA);
      
      if (accountInfo) {
        console.log('📋 Account exists, owner:', accountInfo.owner.toString());
        console.log('📋 Expected owner:', program.programId.toString());
        
        if (!accountInfo.owner.equals(program.programId)) {
          return { 
            exists: false, 
            error: `Registry account exists but is owned by ${accountInfo.owner.toString()}, expected ${program.programId.toString()}` 
          };
        }
        
        // Try to fetch the registry account data
        const registryAccount = await (program.account as any).globalRegistry.fetch(registryPDA);
        console.log('✅ Registry already exists:', registryAccount);
        return { exists: true };
      } else {
        // Account doesn't exist, try to initialize it
        console.log('⚠️ Registry account does not exist, attempting to initialize...');
        
        try {
          const initResult = await initializeRegistry(wallet);
          if (initResult.success) {
            console.log('✅ Registry initialized successfully');
            return { exists: true, initialized: true };
          } else {
            console.error('❌ Failed to initialize registry:', initResult.error);
            return { exists: false, error: initResult.error };
          }
        } catch (initError: any) {
          console.error('❌ Registry initialization error:', initError);
          return { exists: false, error: initError.message };
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching registry:', error);
      
      // If it's an account fetch error, the account might not exist or be corrupted
      if (error.message?.includes('Account does not exist')) {
        console.log('⚠️ Registry does not exist, attempting to initialize...');
        
        try {
          const initResult = await initializeRegistry(wallet);
          if (initResult.success) {
            console.log('✅ Registry initialized successfully');
            return { exists: true, initialized: true };
          } else {
            console.error('❌ Failed to initialize registry:', initResult.error);
            return { exists: false, error: initResult.error };
          }
        } catch (initError: any) {
          console.error('❌ Registry initialization error:', initError);
          return { exists: false, error: initError.message };
        }
      }
      
      return { exists: false, error: error.message };
    }
  } catch (error: any) {
    console.error('❌ Error checking registry:', error);
    return { exists: false, error: error.message };
  }
}

/**
 * Safe wrapper for blockchain operations that ensures registry exists
 */
export async function withRegistryCheck<T>(
  wallet: any,
  operation: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    // Check if registry exists, initialize if needed
    const registryCheck = await ensureRegistryExists(wallet);
    
    if (!registryCheck.exists) {
      return { 
        success: false, 
        error: `Registry not available: ${registryCheck.error}. Please try initializing from the admin dashboard.`
      };
    }

    // Execute the operation
    const result = await operation();
    return { success: true, data: result };
  } catch (error: any) {
    console.error('❌ Blockchain operation failed:', error);
    return { success: false, error: error.message };
  }
}