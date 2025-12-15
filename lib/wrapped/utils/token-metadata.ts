import { createPublicClient, http, parseAbi } from "viem"
import { base } from "viem/chains"

const ERC20_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
])

export class TokenMetadataService {
  private client = createPublicClient({
    chain: base,
    transport: http(),
  })

  private cache = new Map<string, { name: string; symbol: string; decimals: number }>()

  async getMetadata(contractAddress: string) {
    if (this.cache.has(contractAddress)) {
      return this.cache.get(contractAddress)!
    }

    try {
      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        return null
      }

      // Skip zero address
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        return null
      }

      const [name, symbol, decimals] = await Promise.all([
        this.client.readContract({
          address: contractAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "name",
        }).catch(() => "Unknown Token"),
        this.client.readContract({
          address: contractAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "symbol",
        }).catch(() => "TOKEN"),
        this.client.readContract({
          address: contractAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "decimals",
        }).catch(() => 18),
      ])

      const metadata = { name, symbol, decimals }
      this.cache.set(contractAddress, metadata)
      return metadata
    } catch (error) {
      console.warn(`[TokenMetadata] Failed to fetch metadata for ${contractAddress}`)
      return null
    }
  }
}

export const tokenMetadataService = new TokenMetadataService()
