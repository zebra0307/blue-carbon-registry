import { PublicKey } from "@solana/web3.js";

/**
 * Formats a large number with appropriate units (K, M, B)
 */
export function formatNumber(value: number): string {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(1) + "B";
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + "M";
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + "K";
  }
  return value.toFixed(0);
}

/**
 * Formats a token amount with proper decimals
 */
export function formatTokenAmount(amount: number, decimals: number = 6): string {
  const adjustedAmount = amount / Math.pow(10, decimals);
  return formatNumber(adjustedAmount);
}

/**
 * Shortens a public key for display purposes
 */
export function shortenPublicKey(publicKey: PublicKey | string, chars: number = 4): string {
  const key = typeof publicKey === "string" ? publicKey : publicKey.toString();
  return `${key.slice(0, chars)}...${key.slice(-chars)}`;
}

/**
 * Validates if a string is a valid IPFS CID
 */
export function isValidIPFSCID(cid: string): boolean {
  // Basic IPFS CID validation
  const ipfsRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  return ipfsRegex.test(cid);
}

/**
 * Generates IPFS gateway URL
 */
export function getIPFSUrl(cid: string, gateway: string = "https://ipfs.io/ipfs/"): string {
  return `${gateway}${cid}`;
}

/**
 * Validates project ID format
 */
export function isValidProjectId(projectId: string): boolean {
  // Project ID should be alphanumeric with dashes, 3-32 characters
  const projectIdRegex = /^[A-Za-z0-9-]{3,32}$/;
  return projectIdRegex.test(projectId);
}

/**
 * Converts lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1e9;
}

/**
 * Converts SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}
