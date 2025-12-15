// Core User Activity Data
export interface OnchainWrappedData {
  walletAddress: string
  timeRange: TimeRange
  summary: ActivitySummary
  transactions: TransactionAnalytics
  tokens: TokenAnalytics
  nfts: NFTAnalytics
  defi: DeFiAnalytics
  social: SocialAnalytics
  milestones: Milestone[]
  topCounterparties: Counterparty[]
}

export interface TimeRange {
  startDate: Date
  endDate: Date
  label: string // "2024", "Last 12 Months", "All Time"
}

export interface ActivitySummary {
  firstTransactionDate: Date
  lastTransactionDate: Date
  totalDaysActive: number
  mostActiveDayOfWeek: string
  mostActiveMonth: string
  longestStreakDays: number
  totalGasSpentETH: string
  totalGasSpentUSD: string
  chainScore: number // 0-100 engagement score
}

export interface TransactionAnalytics {
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  averageGasPrice: string
  totalValueTransferredUSD: string
  transactionsByMonth: MonthlyData[]
  mostActiveDay: DayActivity
  transactionTypes: TransactionTypeBreakdown
  largestTransaction?: {
    valueUSD: string
    type: string
    hash: string
  }
}

export interface TransactionTypeBreakdown {
  transfers: number
  swaps: number
  nftMints: number
  nftTrades: number
  defiInteractions: number
  contractDeployments: number
  other: number
}

export interface TokenAnalytics {
  uniqueTokensInteracted: number
  totalTokensReceived: number
  totalTokensSent: number
  netTokenFlow: number // positive = accumulator, negative = spender
  topTokensByVolume: TokenVolume[]
  topTokensByTransactionCount: TokenVolume[]
  favoriteToken: TokenVolume // most used
  rareDappInteractions: string[] // unusual protocols
}

export interface TokenVolume {
  symbol: string
  name: string
  address: string
  volumeUSD: string
  transactionCount: number
  imageUrl?: string
}

export interface NFTAnalytics {
  totalNFTsMinted: number
  totalNFTsReceived: number
  totalNFTsSent: number
  totalNFTsBurned: number
  uniqueCollectionsOwned: number
  uniqueCollectionsInteracted: number
  topCollections: NFTCollection[]
  firstNFT: NFTItem | null
  mostRecentNFT: NFTItem | null
  estimatedNFTPortfolioValueUSD: string
}

export interface NFTCollection {
  name: string
  address: string
  itemCount: number
  floorPriceETH?: string
  imageUrl?: string
}

export interface NFTItem {
  collectionName: string
  tokenId: string
  name: string
  imageUrl?: string
  mintDate: Date
}

export interface DeFiAnalytics {
  totalProtocolsUsed: number
  topProtocols: ProtocolInteraction[]
  totalValueSwapped: string
  totalLiquidityProvided: string
  totalYieldEarned: string
  riskProfile: "conservative" | "moderate" | "aggressive"
}

export interface ProtocolInteraction {
  protocolName: string
  category: string // DEX, Lending, Yield, etc.
  interactionCount: number
  totalVolumeUSD: string
  logoUrl?: string
}

export interface SocialAnalytics {
  uniqueWalletsInteractedWith: number
  topRecipients: Counterparty[]
  topSenders: Counterparty[]
  communityScore: number // based on interaction diversity
}

export interface Counterparty {
  address: string
  ensName?: string
  basename?: string
  interactionCount: number
  totalVolumeUSD: string
  avatarUrl?: string
}

export interface Milestone {
  type: "first_tx" | "nft_count" | "gas_milestone" | "protocol_explorer" | "whale_tx" | "streak"
  title: string
  description: string
  date: Date
  icon: string
  rarity: "common" | "rare" | "legendary"
}

export interface MonthlyData {
  month: string
  transactionCount: number
  volumeUSD: string
}

export interface DayActivity {
  date: string
  transactionCount: number
  volumeUSD: string
}

// API Response Types
export interface WalletTransaction {
  hash: string
  from: string
  to: string
  value: string
  gasUsed: string
  gasPrice: string
  timestamp: number
  status: "success" | "failed"
  methodId?: string
  functionName?: string
  transactionType?: string
  logEvents?: number
  decoded?: boolean
  valueUSD?: string
}

export interface TokenBalance {
  contractAddress: string
  symbol: string
  name: string
  decimals: number
  balance: string
  valueUSD?: string
  logo?: string
}

export interface NFTBalance {
  contractAddress: string
  tokenId: string
  name: string
  collectionName: string
  imageUrl?: string
  floorPrice?: string
}

export interface TokenTransfer {
  contractAddress: string
  from: string
  to: string
  value: string
  timestamp: number
  transactionHash: string
  symbol?: string
  name?: string
}

export interface NFTTransfer {
  contractAddress: string
  from: string
  to: string
  tokenId: string
  timestamp: number
  transactionHash: string
}

export type WrappedData = OnchainWrappedData

