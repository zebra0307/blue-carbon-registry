/**
 * Transaction and blockchain error handling utilities
 */

export enum ErrorType {
  USER_REJECTED = 'USER_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PROGRAM_ERROR = 'PROGRAM_ERROR',
  ACCOUNT_ERROR = 'ACCOUNT_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface ParsedError {
  type: ErrorType;
  message: string;
  originalError?: any;
  code?: string;
}

/**
 * Parse transaction error and return user-friendly message
 * @param error The error object from transaction
 * @returns Parsed error with type and message
 */
export function parseTransactionError(error: any): ParsedError {
  const errorMessage = error?.message || error?.toString() || '';

  // User rejected transaction
  if (
    errorMessage.includes('User rejected') ||
    errorMessage.includes('user rejected') ||
    errorMessage.includes('Transaction cancelled')
  ) {
    return {
      type: ErrorType.USER_REJECTED,
      message: 'Transaction cancelled by user',
      originalError: error,
    };
  }

  // Insufficient funds
  if (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('Insufficient lamports')
  ) {
    return {
      type: ErrorType.INSUFFICIENT_FUNDS,
      message: 'Insufficient SOL balance for transaction fee',
      originalError: error,
    };
  }

  // Network/connection errors
  if (
    errorMessage.includes('429') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('network') ||
    errorMessage.includes('fetch failed')
  ) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Network error. Please check your connection and try again.',
      originalError: error,
    };
  }

  // Anchor program errors
  const anchorErrorMatch = errorMessage.match(/Error Code: (\w+)/);
  if (anchorErrorMatch) {
    const errorCode = anchorErrorMatch[1];
    return {
      type: ErrorType.PROGRAM_ERROR,
      message: formatAnchorError(errorCode),
      code: errorCode,
      originalError: error,
    };
  }

  // Custom program errors with number
  const customErrorMatch = errorMessage.match(/custom program error: 0x(\w+)/);
  if (customErrorMatch) {
    const errorHex = customErrorMatch[1];
    return {
      type: ErrorType.PROGRAM_ERROR,
      message: formatCustomError(errorHex),
      code: errorHex,
      originalError: error,
    };
  }

  // Account errors
  if (
    errorMessage.includes('Account does not exist') ||
    errorMessage.includes('AccountNotInitialized')
  ) {
    return {
      type: ErrorType.ACCOUNT_ERROR,
      message: 'Required account does not exist or is not initialized',
      originalError: error,
    };
  }

  // Unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: errorMessage || 'An unknown error occurred',
    originalError: error,
  };
}

/**
 * Format Anchor error codes to user-friendly messages
 * @param code Anchor error code
 * @returns User-friendly error message
 */
function formatAnchorError(code: string): string {
  const errorMap: Record<string, string> = {
    // Authorization errors
    Unauthorized: 'You do not have permission to perform this action',
    InvalidAuthority: 'Invalid authority for this operation',
    OnlyAdminCanInitialize: 'Only administrators can initialize the registry',
    OnlyValidatorCanVerify: 'Only validators can verify projects',
    
    // Registry errors
    RegistryNotInitialized: 'Registry has not been initialized yet',
    RegistryAlreadyInitialized: 'Registry has already been initialized',
    
    // Project errors
    ProjectNotFound: 'Project not found',
    ProjectNotVerified: 'Project must be verified before this operation',
    ProjectAlreadyVerified: 'Project has already been verified',
    InvalidProjectStatus: 'Invalid project status for this operation',
    DuplicateProjectId: 'A project with this ID already exists',
    
    // Verification errors
    InsufficientVerifiers: 'Not enough validators have verified this project',
    VerificationAlreadySubmitted: 'You have already submitted a verification for this project',
    InvalidVerificationData: 'Verification data is invalid',
    
    // Credit errors
    InsufficientCredits: 'Insufficient carbon credits',
    CannotMintUnverifiedProject: 'Cannot mint credits for unverified project',
    InvalidCreditAmount: 'Invalid credit amount',
    CreditsAlreadyMinted: 'Credits have already been minted for this project',
    
    // Monitoring errors
    InvalidMonitoringData: 'Monitoring data is invalid',
    MonitoringDataTooOld: 'Monitoring data timestamp is too old',
    
    // Marketplace errors
    ListingNotFound: 'Marketplace listing not found',
    ListingNotActive: 'This listing is not active',
    InvalidPrice: 'Invalid listing price',
    CannotBuyOwnListing: 'Cannot purchase your own listing',
    
    // Token errors
    InvalidTokenAccount: 'Invalid token account',
    TokenTransferFailed: 'Token transfer failed',
    
    // General errors
    InvalidInput: 'Invalid input data',
    InvalidTimestamp: 'Invalid timestamp',
    MathOverflow: 'Mathematical overflow occurred',
    
    // Common Anchor errors
    AccountNotInitialized: 'Account has not been initialized',
    ConstraintMut: 'Account must be mutable',
    ConstraintHasOne: 'Account constraint violation: has_one',
    ConstraintSigner: 'Account must be a signer',
    ConstraintRaw: 'Raw constraint was violated',
    ConstraintOwner: 'Account owner constraint violated',
    ConstraintRentExempt: 'Account must be rent exempt',
    ConstraintSeeds: 'Seed constraint violated',
    ConstraintExecutable: 'Account must be executable',
    ConstraintState: 'State constraint violated',
    ConstraintAssociated: 'Associated account constraint violated',
  };

  return errorMap[code] || `Program error: ${code}`;
}

/**
 * Format custom program error (hex code)
 * @param errorHex Hex error code
 * @returns User-friendly error message
 */
function formatCustomError(errorHex: string): string {
  const errorCode = parseInt(errorHex, 16);
  
  // Map custom error codes (these would match your errors.rs)
  const customErrors: Record<number, string> = {
    6000: 'Unauthorized access',
    6001: 'Registry not initialized',
    6002: 'Project not verified',
    6003: 'Insufficient credits',
    6004: 'Invalid authority',
    6005: 'Project already verified',
    6006: 'Invalid verification data',
    6007: 'Cannot mint unverified project',
    6008: 'Credits already minted',
    6009: 'Invalid monitoring data',
    6010: 'Listing not found',
    6011: 'Invalid price',
    6012: 'Cannot buy own listing',
  };

  return customErrors[errorCode] || `Custom error code: 0x${errorHex}`;
}

/**
 * Get a concise error message for display
 * @param error Any error object
 * @returns Short error message
 */
export function getErrorMessage(error: any): string {
  return parseTransactionError(error).message;
}

/**
 * Check if error is user-initiated (rejection)
 * @param error Error object
 * @returns True if user rejected
 */
export function isUserRejection(error: any): boolean {
  return parseTransactionError(error).type === ErrorType.USER_REJECTED;
}

/**
 * Check if error is a network issue
 * @param error Error object
 * @returns True if network error
 */
export function isNetworkError(error: any): boolean {
  return parseTransactionError(error).type === ErrorType.NETWORK_ERROR;
}

/**
 * Format error for logging
 * @param error Error object
 * @param context Additional context
 * @returns Formatted log message
 */
export function formatErrorForLogging(error: any, context?: string): string {
  const parsed = parseTransactionError(error);
  const prefix = context ? `[${context}] ` : '';
  return `${prefix}${parsed.type}: ${parsed.message}${parsed.code ? ` (Code: ${parsed.code})` : ''}`;
}
