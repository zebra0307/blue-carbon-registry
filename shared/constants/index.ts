// Solana program addresses and configuration
export const PROGRAM_IDS = {
  BLUE_CARBON_REGISTRY: "GDEzy7wZw5VqSpBr9vDHiMiFa9QahNeZ8UfETMfVPakr",
  TOKEN_PROGRAM: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  SYSTEM_PROGRAM: "11111111111111111111111111111112",
} as const;

// Network configuration
export const NETWORKS = {
  LOCALNET: "http://127.0.0.1:8899",
  DEVNET: "https://api.devnet.solana.com",
  MAINNET: "https://api.mainnet-beta.solana.com",
} as const;

// Token configuration
export const TOKEN_CONFIG = {
  DECIMALS: 6,
  NAME: "Carbon Credit",
  SYMBOL: "CC",
} as const;

// Project configuration
export const PROJECT_CONFIG = {
  MAX_PROJECT_ID_LENGTH: 32,
  MAX_IPFS_CID_LENGTH: 46,
  MIN_PROJECT_DURATION_MONTHS: 12,
  MAX_PROJECT_DURATION_MONTHS: 120,
} as const;

// Transaction limits
export const LIMITS = {
  MAX_MINT_AMOUNT: 1_000_000 * 10 ** TOKEN_CONFIG.DECIMALS,
  MAX_TRANSFER_AMOUNT: 100_000 * 10 ** TOKEN_CONFIG.DECIMALS,
  MIN_TRANSACTION_AMOUNT: 1 * 10 ** TOKEN_CONFIG.DECIMALS,
} as const;
