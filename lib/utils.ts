import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures an Ethereum address has the 0x prefix
 * @param address - The address to normalize
 * @returns The address with 0x prefix, or undefined if no address provided
 */
export function normalizeAddress(address: string | undefined | null): string | undefined {
  if (!address) return undefined
  
  // If address already starts with 0x, return as is
  if (address.startsWith('0x')) {
    return address
  }
  
  // Add 0x prefix
  return `0x${address}`
}
