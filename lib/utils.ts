import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates and normalizes an Ethereum address
 * @param address - The address to normalize
 * @returns The address with 0x prefix if valid, or undefined if invalid/not provided
 */
export function normalizeAddress(address: string | undefined | null): string | undefined {
  if (!address) return undefined
  
  // Remove any whitespace
  address = address.trim()
  
  // Check if it's already a valid Ethereum address with 0x prefix
  if (address.startsWith('0x')) {
    // Ethereum addresses should be exactly 42 characters (0x + 40 hex chars)
    if (address.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      return address.toLowerCase()
    }
    // Invalid Ethereum address format
    return undefined
  }
  
  // Check if it's a valid Ethereum address without 0x prefix (40 hex characters)
  if (address.length === 40 && /^[a-fA-F0-9]{40}$/.test(address)) {
    return `0x${address.toLowerCase()}`
  }
  
  // Not a valid Ethereum address (could be Solana or other chain)
  return undefined
}

/**
 * Checks if an address is a valid Ethereum address
 * @param address - The address to check
 * @returns true if valid Ethereum address, false otherwise
 */
export function isValidEthereumAddress(address: string | undefined | null): boolean {
  if (!address) return false
  const normalized = normalizeAddress(address)
  return normalized !== undefined
}
