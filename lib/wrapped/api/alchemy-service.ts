import { Alchemy, Network, AssetTransfersCategory } from "alchemy-sdk"
import type { IBlockchainDataService } from "./data-service.interface"
import type {
  WalletTransaction,
  TokenBalance,
  NFTBalance,
  TokenTransfer,
  NFTTransfer,
  TimeRange,
} from "@/types/onchain-wrapped"

export class AlchemyDataService implements IBlockchainDataService {
  private alchemy: Alchemy
  private hasApiKey: boolean

  constructor() {
    const apiKey = process.env.ALCHEMY_API_KEY

    if (!apiKey || apiKey === "demo" || apiKey.length < 30) {
      console.warn("[Alchemy] Invalid API key detected (length:", apiKey?.length, "), API calls will fail")
      this.hasApiKey = false
      // Don't initialize Alchemy client at all if no valid key
      this.alchemy = new Alchemy({
        apiKey: "demo",
        network: Network.BASE_MAINNET,
      })
    } else {
      console.log("[Alchemy] Valid API key detected, length:", apiKey.length)
      this.hasApiKey = true
      this.alchemy = new Alchemy({
        apiKey: apiKey,
        network: Network.BASE_MAINNET,
      })
    }
  }

  /**
   * Fetch all transactions using getAssetTransfers with pagination
   * Follows spec: Use fromBlock: "0x0", toBlock: "latest", paginate until complete
   */
  async getTransactions(address: string): Promise<WalletTransaction[]> {
    if (!this.hasApiKey) {
      console.log("[Alchemy] No valid API key, skipping transaction fetch")
      return []
    }

    try {
      console.log("[Alchemy] Fetching all transfers for:", address)

      const allTransfers: any[] = []
      const categories: AssetTransfersCategory[] = [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155,
      ]

      // Fetch sent transfers with pagination
      let pageKey: string | undefined = undefined
      do {
        const response: any = await this.alchemy.core.getAssetTransfers({
          fromAddress: address,
          category: categories,
          fromBlock: "0x0",
          toBlock: "latest",
          maxCount: 1000,
          withMetadata: true,
          pageKey,
        })
        allTransfers.push(...response.transfers)
        pageKey = response.pageKey
      } while (pageKey)

      // Fetch received transfers with pagination
      pageKey = undefined
      do {
        const response: any = await this.alchemy.core.getAssetTransfers({
          toAddress: address,
          category: categories,
          fromBlock: "0x0",
          toBlock: "latest",
          maxCount: 1000,
          withMetadata: true,
          pageKey,
        })
        allTransfers.push(...response.transfers)
        pageKey = response.pageKey
      } while (pageKey)

      // Deduplicate by transaction hash
      const uniqueTransfers = Array.from(new Map(allTransfers.map((tx) => [tx.hash + tx.uniqueId, tx])).values())

      console.log(`[Alchemy] Fetched ${uniqueTransfers.length} unique transfers`)

      // Transform to WalletTransaction format
      const transactions: WalletTransaction[] = uniqueTransfers.map((tx) => ({
        hash: tx.hash,
        from: tx.from || "",
        to: tx.to || "",
        value: tx.value?.toString() || "0",
        gasUsed: "0", // Will be filled by fetching receipts
        gasPrice: "0", // Will be filled by fetching receipts
        timestamp: tx.metadata.blockTimestamp ? new Date(tx.metadata.blockTimestamp).getTime() / 1000 : 0,
        status: "success" as const,
        methodId: tx.category,
        functionName: tx.category,
      }))

      // Fetch gas data for unique transaction hashes
      const uniqueTxHashes = Array.from(new Set(transactions.map((tx) => tx.hash)))
      console.log(`[Alchemy] Fetching gas data for ${uniqueTxHashes.length} transactions`)

      const gasDataMap = new Map<string, { gasUsed: string; gasPrice: string }>()

      // Batch fetch receipts (Alchemy supports batch requests)
      for (let i = 0; i < uniqueTxHashes.length; i += 100) {
        const batch = uniqueTxHashes.slice(i, i + 100)
        const receipts = await Promise.allSettled(batch.map((hash) => this.alchemy.core.getTransactionReceipt(hash)))

        receipts.forEach((result, idx) => {
          if (result.status === "fulfilled" && result.value) {
            const receipt = result.value
            gasDataMap.set(batch[idx], {
              gasUsed: receipt.gasUsed.toString(),
              gasPrice: receipt.effectiveGasPrice?.toString() || "0",
            })
          }
        })
      }

      // Update transactions with gas data
      transactions.forEach((tx) => {
        const gasData = gasDataMap.get(tx.hash)
        if (gasData) {
          tx.gasUsed = gasData.gasUsed
          tx.gasPrice = gasData.gasPrice
        }
      })

      console.log(`[Alchemy] Completed fetching all transaction data`)
      return transactions
    } catch (error) {
      console.error("[Alchemy] Error fetching transactions:", error)
      return []
    }
  }

  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    if (!this.hasApiKey) {
      console.log("[Alchemy] No valid API key, skipping token balance fetch")
      return []
    }

    try {
      console.log("[Alchemy] Fetching token balances for:", address)

      const balances = await this.alchemy.core.getTokenBalances(address)

      const nonZeroBalances = balances.tokenBalances.filter(
        (token) => token.tokenBalance && token.tokenBalance !== "0" && token.tokenBalance !== "0x0",
      )

      if (nonZeroBalances.length === 0) {
        return []
      }

      // Fetch metadata for each token
      const tokenData = await Promise.allSettled(
        nonZeroBalances.map(async (token) => {
          const metadata = await this.alchemy.core.getTokenMetadata(token.contractAddress)
          return {
            contractAddress: token.contractAddress,
            symbol: metadata.symbol || "UNKNOWN",
            name: metadata.name || "Unknown Token",
            decimals: metadata.decimals || 18,
            balance: token.tokenBalance || "0",
            valueUSD: undefined,
            logo: metadata.logo || undefined,
          }
        }),
      )

      const successfulTokens = tokenData
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<TokenBalance>).value)

      return successfulTokens
    } catch (error) {
      console.error("[Alchemy] Error fetching token balances:", error)
      return []
    }
  }

  async getTokenTransfers(address: string, timeRange: TimeRange): Promise<TokenTransfer[]> {
    if (!this.hasApiKey) {
      console.log("[Alchemy] No valid API key, skipping token transfer fetch")
      return []
    }

    try {
      const allTransfers: any[] = []

      // Fetch sent token transfers
      let pageKey: string | undefined = undefined
      do {
        const response: any = await this.alchemy.core.getAssetTransfers({
          fromAddress: address,
          category: [AssetTransfersCategory.ERC20],
          fromBlock: "0x0",
          toBlock: "latest",
          maxCount: 1000,
          withMetadata: true,
          pageKey,
        })

        allTransfers.push(...response.transfers)
        pageKey = response.pageKey
      } while (pageKey)

      // Fetch received token transfers
      pageKey = undefined
      do {
        const response: any = await this.alchemy.core.getAssetTransfers({
          toAddress: address,
          category: [AssetTransfersCategory.ERC20],
          fromBlock: "0x0",
          toBlock: "latest",
          maxCount: 1000,
          withMetadata: true,
          pageKey,
        })

        allTransfers.push(...response.transfers)
        pageKey = response.pageKey
      } while (pageKey)

      // Get unique contract addresses
      const uniqueContracts = Array.from(new Set(allTransfers.map(tx => tx.rawContract?.address).filter(Boolean)))

      // Fetch metadata for all unique tokens
      const tokenMetadataMap = new Map<string, { symbol: string; name: string }>()
      await Promise.allSettled(
        uniqueContracts.map(async (contractAddress) => {
          try {
            const metadata = await this.alchemy.core.getTokenMetadata(contractAddress!)
            tokenMetadataMap.set(contractAddress!, {
              symbol: metadata.symbol || "UNKNOWN",
              name: metadata.name || "Unknown Token"
            })
          } catch (error) {
            // Fallback for failed metadata fetches
            tokenMetadataMap.set(contractAddress!, {
              symbol: "TOKEN",
              name: "Token"
            })
          }
        })
      )

      // Transform to TokenTransfer format with metadata
      const tokenTransfers: TokenTransfer[] = allTransfers.map((tx) => {
        const contractAddress = tx.rawContract?.address || ""
        const metadata = tokenMetadataMap.get(contractAddress) || { symbol: "TOKEN", name: "Token" }

        return {
          contractAddress,
          from: tx.from || "",
          to: tx.to || "",
          value: tx.value?.toString() || "0",
          timestamp: tx.metadata.blockTimestamp ? new Date(tx.metadata.blockTimestamp).getTime() / 1000 : 0,
          transactionHash: tx.hash,
          // Add metadata for analytics
          symbol: metadata.symbol,
          name: metadata.name,
        } as TokenTransfer & { symbol: string; name: string }
      })

      console.log(`[Alchemy] Fetched ${tokenTransfers.length} token transfers for ${uniqueContracts.length} unique tokens`)
      return tokenTransfers
    } catch (error) {
      console.error("[Alchemy] Error fetching token transfers:", error)
      return []
    }
  }

  async getNFTBalances(address: string): Promise<NFTBalance[]> {
    if (!this.hasApiKey) {
      console.log("[Alchemy] No valid API key, skipping NFT balance fetch")
      return []
    }

    try {
      console.log("[Alchemy] Fetching NFTs for:", address)

      const nfts = await this.alchemy.nft.getNftsForOwner(address)

      if (nfts.ownedNfts.length === 0) {
        return []
      }

      return nfts.ownedNfts.map((nft) => ({
        contractAddress: nft.contract.address,
        tokenId: nft.tokenId,
        name: nft.name || `Token #${nft.tokenId}`,
        collectionName: nft.contract.name || nft.collection?.name || "Unknown Collection",
        imageUrl: nft.image?.cachedUrl || nft.image?.thumbnailUrl || nft.image?.pngUrl || undefined,
        floorPrice: undefined,
      }))
    } catch (error) {
      console.error("[Alchemy] Error fetching NFT balances:", error)
      return []
    }
  }

  async getNFTTransfers(address: string, timeRange: TimeRange): Promise<NFTTransfer[]> {
    if (!this.hasApiKey) {
      console.log("[Alchemy] No valid API key, skipping NFT transfer fetch")
      return []
    }

    try {
      const allTransfers: NFTTransfer[] = []

      // Fetch sent NFT transfers
      let pageKey: string | undefined = undefined
      do {
        const response: any = await this.alchemy.core.getAssetTransfers({
          fromAddress: address,
          category: [AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
          fromBlock: "0x0",
          toBlock: "latest",
          maxCount: 1000,
          pageKey,
        })

        response.transfers.forEach((tx: any) => {
          allTransfers.push({
            contractAddress: tx.rawContract?.address || "",
            from: tx.from || "",
            to: tx.to || "",
            tokenId: tx.tokenId || "",
            timestamp: tx.metadata.blockTimestamp ? new Date(tx.metadata.blockTimestamp).getTime() / 1000 : 0,
            transactionHash: tx.hash,
          })
        })

        pageKey = response.pageKey
      } while (pageKey)

      // Fetch received NFT transfers
      pageKey = undefined
      do {
        const response: any = await this.alchemy.core.getAssetTransfers({
          toAddress: address,
          category: [AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
          fromBlock: "0x0",
          toBlock: "latest",
          maxCount: 1000,
          pageKey,
        })

        response.transfers.forEach((tx: any) => {
          allTransfers.push({
            contractAddress: tx.rawContract?.address || "",
            from: tx.from || "",
            to: tx.to || "",
            tokenId: tx.tokenId || "",
            timestamp: tx.metadata.blockTimestamp ? new Date(tx.metadata.blockTimestamp).getTime() / 1000 : 0,
            transactionHash: tx.hash,
          })
        })

        pageKey = response.pageKey
      } while (pageKey)

      return allTransfers
    } catch (error) {
      console.error("[Alchemy] Error fetching NFT transfers:", error)
      return []
    }
  }

  async getENSName(address: string): Promise<string | null> {
    try {
      const ensName = await this.alchemy.core.lookupAddress(address)
      return ensName
    } catch (error) {
      return null
    }
  }

  async getBasename(address: string): Promise<string | null> {
    // Basename resolution would require a separate service/API
    return null
  }

  async getTokenPrice(contractAddress: string, timestamp: number): Promise<number | null> {
    // Alchemy doesn't provide historical price data
    // Would need to integrate with CoinGecko or similar
    return null
  }
}

export { AlchemyDataService as AlchemyService }
