/**
 * Interface for blockchain data providers
 * Implement this interface for GoldRush, Moralis, Zerion, Alchemy, or custom providers
 */

import type {
  WalletTransaction,
  TokenBalance,
  NFTBalance,
  TokenTransfer,
  NFTTransfer,
  TimeRange,
} from "@/types/onchain-wrapped"

export interface IBlockchainDataService {
  getTransactions(address: string, timeRange: TimeRange): Promise<WalletTransaction[]>
  getTokenBalances(address: string): Promise<TokenBalance[]>
  getTokenTransfers(address: string, timeRange: TimeRange): Promise<TokenTransfer[]>
  getNFTBalances(address: string): Promise<NFTBalance[]>
  getNFTTransfers(address: string, timeRange: TimeRange): Promise<NFTTransfer[]>
  getENSName(address: string): Promise<string | null>
  getBasename(address: string): Promise<string | null>
  getTokenPrice(contractAddress: string, timestamp: number): Promise<number | null>
}

