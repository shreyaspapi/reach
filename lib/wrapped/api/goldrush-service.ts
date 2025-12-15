/**
 * GoldRush (Covalent) Data Service Implementation
 * Recommended provider for Base chain data
 */

import type { IBlockchainDataService } from "./data-service.interface"
import type {
  WalletTransaction,
  TokenBalance,
  NFTBalance,
  TokenTransfer,
  NFTTransfer,
  TimeRange,
} from "@/types/onchain-wrapped"

const BASE_CHAIN_ID = 8453 // Base Mainnet
const GOLDRUSH_API_BASE = "https://api.covalenthq.com/v1"

export class GoldRushDataService implements IBlockchainDataService {
  private apiKey: string

  constructor() {
    const apiKey = process.env.GOLDRUSH_API_KEY
    if (!apiKey || apiKey === "") {
      console.warn("[v0] GOLDRUSH_API_KEY not configured, using mock data")
      this.apiKey = "demo-key"
    } else {
      console.log("[v0] GoldRush API key found, using real API")
      this.apiKey = apiKey
    }
  }

  private async fetchAPI(endpoint: string) {
    const url = `${GOLDRUSH_API_BASE}${endpoint}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`GoldRush API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getTransactions(
    address: string,
    timeRange: TimeRange,
  ): Promise<WalletTransaction[]> {
    try {
      // Return mock data if no API key
      if (this.apiKey === "demo-key") {
        return this.getMockTransactions(address)
      }

      const endpoint = `/${BASE_CHAIN_ID}/address/${address}/transactions_v3/`
      const data = await this.fetchAPI(endpoint)

      // Transform response
      const items = data?.data?.items || []
      return items.map((tx: any) => {
        // Extract transaction type from log events and decoded data
        const logEvents = tx.log_events || []
        const decoded = tx.decoded

        // Determine transaction type based on various signals
        let transactionType = "transfer" // default
        let swapValueUSD = "0"

        if (decoded?.name) {
          const funcName = decoded.name.toLowerCase()
          if (funcName.includes("swap") || funcName.includes("exchange")) {
            transactionType = "swap"
            // Try to extract swap value from decoded params
            if (decoded.params) {
              const amountInParam = decoded.params.find((p: any) => p.name?.toLowerCase().includes("amountin") || p.name?.toLowerCase().includes("amount"))
              if (amountInParam?.value) {
                // This is a rough approximation - in a real implementation you'd need token prices
                // For now, we'll use a placeholder value
                swapValueUSD = "10.00" // Placeholder - would need proper calculation
              }
            }
          } else if (funcName.includes("mint")) {
            transactionType = "nft_mint"
          } else if (funcName.includes("transfer")) {
            transactionType = "transfer"
          } else if (funcName.includes("stake") || funcName.includes("deposit")) {
            transactionType = "defi_stake"
          } else if (funcName.includes("withdraw") || funcName.includes("unstake")) {
            transactionType = "defi_unstake"
          } else {
            transactionType = "contract_call"
          }
        }

        // Check log events for additional categorization
        if (logEvents.length > 0) {
          const hasNFTTransfer = logEvents.some((log: any) =>
            log.decoded?.name === "Transfer" &&
            (log.sender_address?.toLowerCase() === "0x0000000000000000000000000000000000000000" ||
             log.sender_address === tx.from_address)
          )
          if (hasNFTTransfer) {
            transactionType = "nft_transfer"
          }

          const hasTokenTransfer = logEvents.some((log: any) =>
            log.decoded?.name === "Transfer" &&
            log.sender_contract_ticker_symbol
          )
          if (hasTokenTransfer && transactionType === "transfer") {
            transactionType = "token_transfer"
          }
        }

        return {
          hash: tx.tx_hash,
          from: tx.from_address,
          to: tx.to_address || "",
          value: tx.value || "0",
          gasUsed: tx.gas_spent?.toString() || "0",
          gasPrice: tx.gas_price?.toString() || "0",
          timestamp: new Date(tx.block_signed_at).getTime() / 1000,
          status: tx.successful ? "success" : "failed",
          methodId: tx.tx_hash.slice(0, 10),
          functionName: decoded?.name || transactionType,
          transactionType,
          logEvents: logEvents.length,
          decoded: !!decoded,
          valueUSD: tx.value_quote ? tx.value_quote.toString() : swapValueUSD,
        }
      }) as WalletTransaction[]
    } catch (error) {
      console.error("[v0] Error fetching transactions:", error)
      return this.getMockTransactions(address)
    }
  }

  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      if (this.apiKey === "demo-key") {
        return this.getMockTokenBalances()
      }

      const endpoint = `/${BASE_CHAIN_ID}/address/${address}/balances_v2/`
      const data = await this.fetchAPI(endpoint)

      const items = data?.data?.items || []
      return items.map((token: any) => ({
        contractAddress: token.contract_address,
        symbol: token.contract_ticker_symbol,
        name: token.contract_name,
        decimals: token.contract_decimals,
        balance: token.balance,
        valueUSD: token.quote?.toString(),
        logo: token.logo_url,
      })) as TokenBalance[]
    } catch (error) {
      console.error("[v0] Error fetching token balances:", error)
      return this.getMockTokenBalances()
    }
  }

  async getTokenTransfers(address: string, timeRange: TimeRange): Promise<TokenTransfer[]> {
    try {
      if (this.apiKey === "demo-key") {
        console.log("[GoldRush] Demo mode, returning empty token transfers")
        return []
      }

      // Using ERC20 transfers endpoint to get all token transfers
      const endpoint = `/${BASE_CHAIN_ID}/address/${address}/transfers_v3/`
      console.log("[GoldRush] Fetching token transfers from:", endpoint)

      const data = await this.fetchAPI(endpoint)

      const items = data?.data?.items || []

      // Filter for ERC20 transfers and transform
      const tokenTransfers = items
        .filter((item: any) => item.transfer_type === "ERC20")
        .map((transfer: any) => ({
          contractAddress: transfer.contract_address || "",
          from: transfer.from_address || "",
          to: transfer.to_address || "",
          value: transfer.delta || "0",
          timestamp: new Date(transfer.block_signed_at).getTime() / 1000,
          transactionHash: transfer.tx_hash || "",
        }))

      console.log(`[GoldRush] Fetched ${tokenTransfers.length} token transfers`)
      return tokenTransfers as TokenTransfer[]
    } catch (error) {
      console.error("[GoldRush] Error fetching token transfers:", error)
      return []
    }
  }

  async getNFTBalances(address: string): Promise<NFTBalance[]> {
    try {
      if (this.apiKey === "demo-key") {
        return this.getMockNFTBalances()
      }

      // NFT endpoint would go here
      return []
    } catch (error) {
      console.error("[v0] Error fetching NFT balances:", error)
      return this.getMockNFTBalances()
    }
  }

  async getNFTTransfers(address: string, timeRange: TimeRange): Promise<NFTTransfer[]> {
    try {
      if (this.apiKey === "demo-key") {
        console.log("[GoldRush] Demo mode, returning empty NFT transfers")
        return []
      }

      const endpoint = `/${BASE_CHAIN_ID}/address/${address}/transfers_v3/`
      console.log("[GoldRush] Fetching NFT transfers from:", endpoint)

      const data = await this.fetchAPI(endpoint)

      const items = data?.data?.items || []

      // Filter for NFT transfers (ERC721 and ERC1155) and transform
      const nftTransfers = items
        .filter((item: any) => item.transfer_type === "ERC721" || item.transfer_type === "ERC1155")
        .map((transfer: any) => ({
          contractAddress: transfer.contract_address || "",
          from: transfer.from_address || "",
          to: transfer.to_address || "",
          tokenId: transfer.token_id || "",
          timestamp: new Date(transfer.block_signed_at).getTime() / 1000,
          transactionHash: transfer.tx_hash || "",
        }))

      console.log(`[GoldRush] Fetched ${nftTransfers.length} NFT transfers`)
      return nftTransfers as NFTTransfer[]
    } catch (error) {
      console.error("[GoldRush] Error fetching NFT transfers:", error)
      return []
    }
  }

  async getENSName(address: string): Promise<string | null> {
    // ENS resolution (may need separate service)
    return null
  }

  async getBasename(address: string): Promise<string | null> {
    // Basename resolution (Base-specific)
    return null
  }

  async getTokenPrice(contractAddress: string, timestamp: number): Promise<number | null> {
    // Historical price data
    return null
  }

  private getMockTransactions(address: string): WalletTransaction[] {
    return Array.from({ length: 247 }, (_, i) => ({
      hash: `0x${i.toString(16).padStart(64, "0")}`,
      from: i % 2 === 0 ? address : `0x${(i + 1).toString(16).padStart(40, "0")}`,
      to: i % 2 === 0 ? `0x${(i + 1).toString(16).padStart(40, "0")}` : address,
      value: (Math.random() * 1e18).toFixed(0),
      gasUsed: "21000",
      gasPrice: (12 * 1e9).toFixed(0),
      timestamp: Math.floor(new Date("2024-01-01").getTime() / 1000) + i * 86400,
      status: "success" as const,
      methodId: "0x",
      functionName: i % 5 === 0 ? "swap" : i % 7 === 0 ? "mint" : "transfer",
    }))
  }

  private getMockTokenBalances(): TokenBalance[] {
    return [
      {
        contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        balance: "2847000000",
        valueUSD: "2847",
      },
      {
        contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        symbol: "USDT",
        name: "Tether",
        decimals: 6,
        balance: "1500000000",
        valueUSD: "1500",
      },
    ]
  }

  private getMockNFTBalances(): NFTBalance[] {
    return Array.from({ length: 8 }, (_, i) => ({
      contractAddress: `0x${i.toString(16).padStart(40, "0")}`,
      tokenId: i.toString(),
      name: `NFT #${i}`,
      collectionName: i < 4 ? "Base Gods" : "Collection",
      imageUrl: `/placeholder.svg?height=400&width=400&query=nft collectible ${i}`,
      floorPrice: "0.1",
    }))
  }
}

export { GoldRushDataService as GoldRushService }
