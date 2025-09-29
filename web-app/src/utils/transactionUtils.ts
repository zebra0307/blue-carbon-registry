/**
 * Blockchain transaction utilities for debugging and logging
 */
import { Connection, TransactionSignature, PublicKey } from '@solana/web3.js';
import { logger, blockchainLogger } from './logger';

/**
 * Get detailed transaction information
 */
export async function getTransactionDetails(
  signature: TransactionSignature,
  connection: Connection
) {
  try {
    blockchainLogger.info(`Fetching transaction details for: ${signature}`);
    
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!transaction) {
      blockchainLogger.warn(`Transaction not found: ${signature}`);
      return null;
    }
    
    // Extract useful information
    const {
      blockTime,
      meta,
      transaction: transactionData,
    } = transaction;
    
    const timestamp = blockTime ? new Date(blockTime * 1000).toISOString() : 'unknown';
    const status = meta?.err ? 'failed' : 'success';
    // Handle versioned transactions
    const accounts = transactionData.message.staticAccountKeys.map((key: PublicKey) => key.toString());
    const logs = meta?.logMessages || [];
    const fee = meta?.fee || 0;
    
    blockchainLogger.info(`Transaction ${signature} status: ${status}`, {
      data: { timestamp, accounts: accounts.length }
    });
    
    return {
      signature,
      timestamp,
      status,
      accounts,
      logs,
      fee,
      rawTransaction: transaction,
    };
  } catch (error) {
    blockchainLogger.error(`Error fetching transaction details: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Check if a transaction was successful
 */
export async function isTransactionSuccessful(
  signature: TransactionSignature, 
  connection: Connection
): Promise<boolean> {
  try {
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    return transaction?.meta?.err === null;
  } catch (error) {
    blockchainLogger.error(`Error checking transaction status: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Find all transactions for a wallet address
 */
export async function findTransactionsForWallet(
  walletAddress: PublicKey,
  connection: Connection,
  limit: number = 10
) {
  try {
    blockchainLogger.info(`Finding recent transactions for wallet: ${walletAddress.toString()}`);
    
    const transactions = await connection.getSignaturesForAddress(
      walletAddress,
      { limit }
    );
    
    blockchainLogger.info(`Found ${transactions.length} transactions`);
    return transactions;
  } catch (error) {
    blockchainLogger.error(`Error finding wallet transactions: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

/**
 * Monitor a transaction and log its progress
 */
export async function monitorTransaction(
  signature: TransactionSignature,
  connection: Connection
): Promise<boolean> {
  try {
    blockchainLogger.info(`Monitoring transaction: ${signature}`);
    
    // First confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      blockchainLogger.error(`Transaction failed: ${signature}`, { 
        data: confirmation.value.err 
      });
      return false;
    }
    
    blockchainLogger.info(`Transaction confirmed: ${signature}`);
    
    // Get more details
    const details = await getTransactionDetails(signature, connection);
    
    if (details) {
      blockchainLogger.info(`Transaction details:`, { data: {
        status: details.status,
        timestamp: details.timestamp,
        fee: details.fee,
      }});
    }
    
    return true;
  } catch (error) {
    blockchainLogger.error(`Error monitoring transaction: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}