/**
 * Core analytics engine for computing Wrapped metrics
 */

import type {
  OnchainWrappedData,
  ActivitySummary,
  TransactionAnalytics,
  TokenAnalytics,
  NFTAnalytics,
  DeFiAnalytics,
  SocialAnalytics,
  Milestone,
  WalletTransaction,
  TokenTransfer,
  NFTTransfer,
  NFTBalance,
  TimeRange,
} from "@/types/onchain-wrapped"

export class WrappedAnalytics {
  /**
   * Main entry point: compute all wrapped metrics
   */
  async computeWrapped(
    address: string,
    transactions: WalletTransaction[],
    tokenTransfers: TokenTransfer[],
    nftTransfers: NFTTransfer[],
    nftBalances: NFTBalance[],
    timeRange: TimeRange,
  ): Promise<OnchainWrappedData> {
    // Compute all analytics in parallel
    const [transactionAnalytics, tokenAnalytics, nftAnalytics, defiAnalytics, socialAnalytics] = await Promise.all([
      this.computeTransactionAnalytics(transactions),
      this.computeTokenAnalytics(tokenTransfers, address, transactions),
      this.computeNFTAnalytics(nftTransfers, nftBalances, address),
      this.computeDeFiAnalytics(transactions),
      this.computeSocialAnalytics(transactions, tokenTransfers, address),
    ])

    // Compute summary with all data available
    const summary = this.computeActivitySummary(transactions, {
      transactions: transactionAnalytics,
      tokens: tokenAnalytics,
      nfts: nftAnalytics,
      defi: defiAnalytics,
      social: socialAnalytics,
    })

    // Calculate chain score with all analytics data
    summary.chainScore = this.calculateChainScore({
      walletAddress: address,
      timeRange,
      summary,
      transactions: transactionAnalytics,
      tokens: tokenAnalytics,
      nfts: nftAnalytics,
      defi: defiAnalytics,
      social: socialAnalytics,
    })

    // Detect milestones
    const milestones = this.computeMilestones({
      walletAddress: address,
      timeRange,
      summary,
      transactions: transactionAnalytics,
      tokens: tokenAnalytics,
      nfts: nftAnalytics,
      defi: defiAnalytics,
      social: socialAnalytics,
      milestones: [],
      topCounterparties: [],
    })

    return {
      walletAddress: address,
      timeRange,
      summary,
      transactions: transactionAnalytics,
      tokens: tokenAnalytics,
      nfts: nftAnalytics,
      defi: defiAnalytics,
      social: socialAnalytics,
      milestones,
      topCounterparties: socialAnalytics.topRecipients,
    }
  }

  computeTransactionAnalytics(transactions: WalletTransaction[]): TransactionAnalytics {
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        averageGasPrice: "0",
        totalValueTransferredUSD: "0",
        transactionsByMonth: [],
        mostActiveDay: { date: "", transactionCount: 0, volumeUSD: "0" },
        transactionTypes: {
          transfers: 0,
          swaps: 0,
          nftMints: 0,
          nftTrades: 0,
          defiInteractions: 0,
          contractDeployments: 0,
          other: 0,
        },
        largestTransaction: {
          valueUSD: "0.00",
          type: "no transactions",
          hash: "",
        },
      }
    }

    const successful = transactions.filter((tx) => tx.status === "success")
    const failed = transactions.filter((tx) => tx.status === "failed")

    // Calculate average gas price
    const totalGasPrice = successful.reduce((sum, tx) => {
      const gasPriceWei = BigInt(tx.gasPrice || "0")
      const gasUsed = BigInt(tx.gasUsed || "0")
      const gasCostWei = gasPriceWei * gasUsed
      return sum + gasCostWei
    }, BigInt(0))
    const avgGasPrice = successful.length > 0 ? totalGasPrice / BigInt(successful.length) : BigInt(0)

    // Calculate total volume transferred (ETH value)
    const totalVolumeWei = transactions.reduce((sum, tx) => sum + BigInt(tx.value || "0"), BigInt(0))
    const totalVolumeETH = Number(totalVolumeWei) / 1e18
    // Convert ETH to USD (using approximate price of $2500)
    const totalVolumeUSD = totalVolumeETH * 2500

    // Group by month
    const byMonth: Record<string, { count: number; volume: bigint }> = {}
    transactions.forEach((tx) => {
      const date = new Date(tx.timestamp * 1000)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { count: 0, volume: BigInt(0) }
      }
      byMonth[monthKey].count++
      byMonth[monthKey].volume += BigInt(tx.value || "0")
    })

    const transactionsByMonth = Object.entries(byMonth).map(([month, data]) => ({
      month,
      transactionCount: data.count,
      volumeUSD: (Number(data.volume) / 1e18).toFixed(2),
    }))

    // Find most active day
    const byDay: Record<string, { count: number; volume: bigint }> = {}
    transactions.forEach((tx) => {
      const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0]
      if (!byDay[date]) {
        byDay[date] = { count: 0, volume: BigInt(0) }
      }
      byDay[date].count++
      byDay[date].volume += BigInt(tx.value || "0")
    })

    const mostActiveDay = Object.entries(byDay)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([date, data]) => ({
        date,
        transactionCount: data.count,
        volumeUSD: (Number(data.volume) / 1e18).toFixed(2),
      }))[0] || { date: "", transactionCount: 0, volumeUSD: "0" }

    // Categorize transaction types using Covalent API data
    const transactionTypes = {
      transfers: 0,
      swaps: 0,
      nftMints: 0,
      nftTrades: 0,
      defiInteractions: 0,
      contractDeployments: 0,
      other: 0,
    }

    // Use transaction types from Covalent API
    transactions.forEach((tx) => {
      const txType = tx.transactionType || "other"

      switch (txType) {
        case "transfer":
        case "token_transfer":
          transactionTypes.transfers++
          break
        case "swap":
        case "exchange":
          transactionTypes.swaps++
          break
        case "nft_mint":
        case "mint":
          transactionTypes.nftMints++
          break
        case "nft_transfer":
          transactionTypes.nftTrades++
          break
        case "defi_stake":
        case "defi_unstake":
        case "contract_call":
          transactionTypes.defiInteractions++
          break
        default:
          // Check for contract deployments
          if (!tx.to) {
            transactionTypes.contractDeployments++
          } else {
            transactionTypes.other++
          }
          break
      }
    })
    transactionTypes.other =
      transactions.length -
      Object.values(transactionTypes)
        .filter((_, i) => i < 6)
        .reduce((sum, v) => sum + v, 0)

    // Find largest transaction by value or gas cost
    let largestTransaction = null

    // First, look for transactions with actual ETH value (transfers of ETH)
    const ethTransactions = transactions
      .filter((tx) => tx.value && tx.value !== "0")
      .sort((a, b) => Number(BigInt(b.value || "0") - BigInt(a.value || "0")))

    if (ethTransactions.length > 0) {
      // Use ETH value transaction - this is the actual largest by dollar value
      const tx = ethTransactions[0]
      const valueETH = Number(BigInt(tx.value || "0")) / 1e18
      const valueUSD = valueETH * 2500 // Use consistent $2500 ETH price
      largestTransaction = {
        valueUSD: valueUSD.toFixed(2),
        type: "ETH transfer",
        hash: tx.hash,
      }
    } else {
      // Fall back to gas cost for contract calls (most common case)
      // Sort by gas cost (gasPrice * gasUsed) to find most expensive transaction
      const gasTransactions = transactions
        .filter((tx) => tx.gasUsed && tx.gasPrice && tx.gasUsed !== "0" && tx.gasPrice !== "0")
        .sort((a, b) => {
          const aCost = BigInt(a.gasPrice || "0") * BigInt(a.gasUsed || "0")
          const bCost = BigInt(b.gasPrice || "0") * BigInt(b.gasUsed || "0")
          return Number(bCost - aCost)
        })

      if (gasTransactions.length > 0) {
        const tx = gasTransactions[0]
        const gasCostWei = BigInt(tx.gasPrice || "0") * BigInt(tx.gasUsed || "0")
        const gasCostETH = Number(gasCostWei) / 1e18
        const gasCostUSD = gasCostETH * 2500 // Use consistent $2500 ETH price
        largestTransaction = {
          valueUSD: gasCostUSD.toFixed(2),
          type: tx.functionName || "contract call",
          hash: tx.hash,
        }
      }
    }

    // If still no largest transaction found but we have transactions, use the first one with $0.00
    if (!largestTransaction && transactions.length > 0) {
      const tx = transactions[0]
      largestTransaction = {
        valueUSD: "0.00",
        type: tx.functionName || "transaction",
        hash: tx.hash,
      }
    }

    return {
      totalTransactions: transactions.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      averageGasPrice: avgGasPrice.toString(),
      totalValueTransferredUSD: totalVolumeUSD.toFixed(2),
      transactionsByMonth,
      mostActiveDay,
      transactionTypes,
        largestTransaction: largestTransaction || undefined,
    }
  }

  computeTokenAnalytics(
    transfers: TokenTransfer[],
    address: string,
    transactions?: WalletTransaction[],
  ): TokenAnalytics {
    // If no dedicated token transfers but we have transactions, try to extract token info
    let processedTransfers = transfers
    if (transfers.length === 0 && transactions) {
      // Create synthetic token transfers from transactions with token_transfer type
      const tokenTransactions = transactions.filter(
        (tx) => tx.transactionType === "token_transfer" || tx.functionName === "token_transfer",
      )
      if (tokenTransactions.length > 0) {
        // Create a synthetic transfer for each token transaction
        processedTransfers = tokenTransactions.map((tx) => ({
          contractAddress: "0x0000000000000000000000000000000000000000", // Unknown token
          from: tx.from,
          to: tx.to,
          value: "1", // Placeholder value since we don't know the actual amount
          timestamp: tx.timestamp,
          transactionHash: tx.hash,
          symbol: "TOKEN", // Placeholder
          name: "Token",
        }))
      }
    }

    if (processedTransfers.length === 0) {
      return {
        uniqueTokensInteracted: 0,
        totalTokensReceived: 0,
        totalTokensSent: 0,
        netTokenFlow: 0,
        topTokensByVolume: [],
        topTokensByTransactionCount: [],
        favoriteToken: { symbol: "N/A", name: "None", address: "", volumeUSD: "0", transactionCount: 0 },
        rareDappInteractions: [],
      }
    }

    const received = processedTransfers.filter((t) => t.to.toLowerCase() === address.toLowerCase())
    const sent = processedTransfers.filter((t) => t.from.toLowerCase() === address.toLowerCase())

    // Group by token
    const tokenData: Record<string, { count: number; volume: bigint; symbol: string; name: string }> = {}

    processedTransfers.forEach((transfer) => {
      const key = transfer.contractAddress
      if (!tokenData[key]) {
        tokenData[key] = {
          count: 0,
          volume: BigInt(0),
          symbol: transfer.symbol || "TOKEN",
          name: transfer.name || "Token",
        }
      }
      tokenData[key].count++
      tokenData[key].volume += BigInt(transfer.value || "0")
    })

    const topTokensByVolume = Object.entries(tokenData)
      .sort((a, b) => (b[1].volume > a[1].volume ? 1 : -1))
      .slice(0, 10)
      .map(([address, data]) => ({
        symbol: data.symbol,
        name: data.name,
        address,
        volumeUSD: "0", // TODO: Calculate actual USD volume
        transactionCount: data.count,
      }))

    const topTokensByTransactionCount = Object.entries(tokenData)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([address, data]) => ({
        symbol: data.symbol,
        name: data.name,
        address,
        volumeUSD: "0", // TODO: Calculate actual USD volume
        transactionCount: data.count,
      }))

    return {
      uniqueTokensInteracted: Object.keys(tokenData).length,
      totalTokensReceived: received.length,
      totalTokensSent: sent.length,
      netTokenFlow: received.length - sent.length,
      topTokensByVolume,
      topTokensByTransactionCount,
      favoriteToken: topTokensByTransactionCount[0] || {
        symbol: "N/A",
        name: "None",
        address: "",
        volumeUSD: "0",
        transactionCount: 0,
      },
      rareDappInteractions: [],
    }
  }

  computeNFTAnalytics(nftTransfers: NFTTransfer[], nftBalances: NFTBalance[], address: string): NFTAnalytics {
    const minted = nftTransfers.filter(
      (t) => t.from === "0x0000000000000000000000000000000000000000" && t.to.toLowerCase() === address.toLowerCase(),
    )
    const received = nftTransfers.filter(
      (t) => t.to.toLowerCase() === address.toLowerCase() && t.from !== "0x0000000000000000000000000000000000000000",
    )
    const sent = nftTransfers.filter((t) => t.from.toLowerCase() === address.toLowerCase())
    const burned = nftTransfers.filter(
      (t) => t.from.toLowerCase() === address.toLowerCase() && t.to === "0x0000000000000000000000000000000000000000",
    )

    // Group by collection
    const collections: Record<string, number> = {}
    nftBalances.forEach((nft) => {
      collections[nft.contractAddress] = (collections[nft.contractAddress] || 0) + 1
    })

    const topCollections = Object.entries(collections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([address, count]) => ({
        name: "Collection",
        address,
        itemCount: count,
      }))

    const firstNFT = minted.length > 0 ? minted.sort((a, b) => a.timestamp - b.timestamp)[0] : null
    const mostRecentNFT = nftTransfers.length > 0 ? nftTransfers.sort((a, b) => b.timestamp - a.timestamp)[0] : null

    return {
      totalNFTsMinted: minted.length,
      totalNFTsReceived: received.length,
      totalNFTsSent: sent.length,
      totalNFTsBurned: burned.length,
      uniqueCollectionsOwned: Object.keys(collections).length,
      uniqueCollectionsInteracted: new Set(nftTransfers.map((t) => t.contractAddress)).size,
      topCollections,
      firstNFT: firstNFT
        ? {
            collectionName: "Collection",
            tokenId: firstNFT.tokenId,
            name: "NFT",
            mintDate: new Date(firstNFT.timestamp * 1000),
          }
        : null,
      mostRecentNFT: mostRecentNFT
        ? {
            collectionName: "Collection",
            tokenId: mostRecentNFT.tokenId,
            name: "NFT",
            mintDate: new Date(mostRecentNFT.timestamp * 1000),
          }
        : null,
      estimatedNFTPortfolioValueUSD: "0",
    }
  }

  computeDeFiAnalytics(transactions: WalletTransaction[]): DeFiAnalytics {
    // Consider all contract interactions as potential DeFi since most are contract calls
    const defiTxs = transactions.filter(
      (tx) =>
        // Contract interactions (not simple transfers)
        (!tx.methodId || tx.methodId !== "0x") &&
        // Not failed transactions
        tx.status === "success",
    )

    const protocols: Record<string, { count: number; volume: bigint }> = {}

    defiTxs.forEach((tx) => {
      const protocol = tx.to || "Unknown"
      if (!protocols[protocol]) {
        protocols[protocol] = { count: 0, volume: BigInt(0) }
      }
      protocols[protocol].count++
      protocols[protocol].volume += BigInt(tx.value || "0")
    })

    // Get top protocols by interaction count
    const topProtocols = Object.entries(protocols)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([address, data]) => ({
        protocolName: this.getProtocolName(address),
        category: this.getProtocolCategory(address),
        interactionCount: data.count,
        totalVolumeUSD: "0",
      }))

    // Calculate total value swapped from swap transactions
    const totalValueSwapped = transactions
      .filter((tx) => tx.transactionType === "swap")
      .reduce((sum, tx) => sum + Number.parseFloat(tx.valueUSD || "0"), 0)
      .toFixed(2)

    const riskProfile = defiTxs.length > 50 ? "aggressive" : defiTxs.length > 20 ? "moderate" : "conservative"

    return {
      totalProtocolsUsed: Object.keys(protocols).length,
      topProtocols,
      totalValueSwapped,
      totalLiquidityProvided: "0",
      totalYieldEarned: "0",
      riskProfile,
    }
  }

  private getProtocolName(address: string): string {
    // Known protocol addresses on Base
    const knownProtocols: Record<string, string> = {
      "0x6b175474e89094c44da98b954eedeac495271d0f": "MakerDAO",
      "0xa0b86a33e6c9bfd1b2127e9e7e8c8a5f5f0b5c1": "Uniswap",
      "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "Uniswap V2",
      "0xe592427a0aece92de3edee1f18e0157c05861564": "Uniswap V3",
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "Uniswap V3 Factory",
      "0xc36442b4a4522e871399cd717abdd847ab11fe88": "Uniswap V3 Positions NFT",
      "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": "Uniswap V3 Quoter",
      "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6": "Uniswap V3 Router",
      "0x4200000000000000000000000000000000000006": "Wrapped Ether",
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USD Coin",
      "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": "Dai Stablecoin",
      "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22": "Coinbase Wrapped Staked ETH",
      "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf": "Tether USD",
      "0x4ed4e862860bed51a957e4664a9801593f98d1c5": "Degen",
      "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b": "Balancer",
      "0xba12222222228d8ba445958a75a0704d566bf2c8": "Balancer Vault",
      "0x8f8ef111b67c04eb1641f5ff19eeeb150cf7c550": "Compound",
      "0xa238dd80c259a72e81d7e4664a9801593f98d1c5": "Curve",
      "0x4f01aed16d97e3ab5ab2b501154dc9bb0f1a5a2c": "SushiSwap",
      "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2": "SushiToken",
      "0xc2e7df60dbdd976c61819c36f4c155ad2c352876": "1inch",
      "0x1111111254fb6c44bac0bed2854e76f51c33b150": "1inch V4",
      "0x220b95f4f1bf27a0c781c03b031f8a6e2c2e1b6": "0x",
      "0xdef1c0ded9bec7f1cd75d3c7bc6d7df0f9b1a6e": "0x Exchange Proxy",
      "0x7d2768de32b0b80b7a3464c06bdac94a69ddc7a9": "Aave",
      "0x057835ad21a89cfe90a6df6c22b2c39a3e44b5b2": "Aave V3 Pool",
      "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": "Aave V3 Pool Data Provider",
      "0x2f39d218133afab8f2b819b1066c7e434ad94e9e": "Aave V3 Pool Addresses Provider",
      "0x8164cc65827dcfe994ab23944cbc90e0aa80bfcb": "Compound V3 USDC",
      "0xc3d688b66703497daa19211eedff47f25384cdc3": "Compound V3 WETH",
      "0xa17581a9e3356d9a858b789d68b4d866e593ae94": "Compound Comptroller",
      "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b": "Compound Comptroller V2",
      "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5": "Compound cETH",
      "0x39aa39c021dfbae8fac545936693ac917d5e7563": "Compound cUSDC",
      "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643": "Compound cDAI",
      "0x4b0181102a0112a2ef11abee5563bb4a3176c9d7": "Synthetix",
      "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f": "Synthetix Proxy sUSD",
      "0x57ab1ec28d129707052df4df418d58a2d46d5f51": "Synthetix Debt Cache",
      "0x0e2a5c7b7e7b8a3b8f2b8f2b8f2b8f2b8f2b8f": "Yearn",
      "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e": "Yearn yCRV",
      "0x5f18c75abdae578b483e5f43f12a39cf75b973a9": "Yearn Registry",
      "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9": "FTM",
      "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0": "Frax Share",
      "0x183015a9ba6ff60230f8799079ae558bdcbba2b0": "Frax Price Index",
      "0x853d955acef822db058eb8505911ed77f175b99e": "Frax",
    }

    return knownProtocols[address.toLowerCase()] || `0x${address.slice(-4)}`
  }

  private getProtocolCategory(address: string): string {
    // Simple categorization based on known protocols
    const dexes = ["uniswap", "sushiswap", "1inch", "0x", "balancer", "curve"]
    const lending = ["aave", "compound", "makerdao"]
    const staking = ["yearn", "frax", "synthetix"]

    const name = this.getProtocolName(address).toLowerCase()

    if (dexes.some((dex) => name.includes(dex))) return "DEX"
    if (lending.some((lend) => name.includes(lend))) return "Lending"
    if (staking.some((stake) => name.includes(stake))) return "Staking"

    return "DeFi"
  }

  computeSocialAnalytics(
    transactions: WalletTransaction[],
    tokenTransfers: TokenTransfer[],
    address: string,
  ): SocialAnalytics {
    const recipients = new Map<string, { count: number; volume: bigint }>()
    const senders = new Map<string, { count: number; volume: bigint }>()

    transactions.forEach((tx) => {
      const isOutgoing = tx.from.toLowerCase() === address.toLowerCase()
      const counterparty = isOutgoing ? tx.to : tx.from

      if (counterparty && counterparty !== address.toLowerCase()) {
        const map = isOutgoing ? recipients : senders
        const data = map.get(counterparty) || { count: 0, volume: BigInt(0) }
        data.count++
        data.volume += BigInt(tx.value || "0")
        map.set(counterparty, data)
      }
    })

    const topRecipients = Array.from(recipients.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([addr, data]) => ({
        address: addr,
        interactionCount: data.count,
        totalVolumeUSD: "0",
      }))

    const topSenders = Array.from(senders.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([addr, data]) => ({
        address: addr,
        interactionCount: data.count,
        totalVolumeUSD: "0",
      }))

    return {
      uniqueWalletsInteractedWith: recipients.size + senders.size,
      topRecipients,
      topSenders,
      communityScore: Math.min(100, (recipients.size + senders.size) * 2),
    }
  }

  computeActivitySummary(transactions: WalletTransaction[], analytics: any): ActivitySummary {
    if (transactions.length === 0) {
      return {
        firstTransactionDate: new Date(),
        lastTransactionDate: new Date(),
        totalDaysActive: 0,
        mostActiveDayOfWeek: "N/A",
        mostActiveMonth: "N/A",
        longestStreakDays: 0,
        totalGasSpentETH: "0",
        totalGasSpentUSD: "0",
        chainScore: 0,
      }
    }

    const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp)
    const firstTx = sorted[0]
    const lastTx = sorted[sorted.length - 1]

    const uniqueDays = new Set(transactions.map((tx) => new Date(tx.timestamp * 1000).toISOString().split("T")[0])).size

    const dayOfWeekCounts: Record<string, number> = {}
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    transactions.forEach((tx) => {
      const day = days[new Date(tx.timestamp * 1000).getDay()]
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1
    })
    const mostActiveDayOfWeek = Object.entries(dayOfWeekCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

    const monthCounts: Record<string, number> = {}
    transactions.forEach((tx) => {
      const month = new Date(tx.timestamp * 1000).toLocaleString("default", { month: "long" })
      monthCounts[month] = (monthCounts[month] || 0) + 1
    })
    const mostActiveMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

    // Calculate gas cost (gasPrice in wei, convert to ETH)
    const totalGas = transactions.reduce((sum, tx) => {
      const gasPriceWei = BigInt(tx.gasPrice || "0")
      const gasUsed = BigInt(tx.gasUsed || "0")
      const gasCostWei = gasPriceWei * gasUsed
      const gasCostETH = Number(gasCostWei) / 1e18
      return sum + gasCostETH
    }, 0)

    // Approximate gas cost in USD (using ~$2500 ETH price)
    const totalGasUSD = (totalGas * 2500).toFixed(2)

    return {
      firstTransactionDate: new Date(firstTx.timestamp * 1000),
      lastTransactionDate: new Date(lastTx.timestamp * 1000),
      totalDaysActive: uniqueDays,
      mostActiveDayOfWeek,
      mostActiveMonth,
      longestStreakDays: 0,
      totalGasSpentETH: totalGas.toString(),
      totalGasSpentUSD: totalGasUSD,
      chainScore: 0, // Will be calculated above
    }
  }

  computeMilestones(data: OnchainWrappedData): Milestone[] {
    const milestones: Milestone[] = []

    // First transaction
    if (data.summary?.firstTransactionDate) {
      milestones.push({
        type: "first_tx",
        title: "First Transaction",
        description: "Your first step onchain",
        date: data.summary.firstTransactionDate,
        icon: "trophy",
        rarity: "common",
      })
    }

    // 100 transactions
    if (data.transactions?.totalTransactions && data.transactions.totalTransactions >= 100) {
      milestones.push({
        type: "whale_tx",
        title: "100 Transactions",
        description: "You're getting active!",
        date: new Date(),
        icon: "star",
        rarity: "rare",
      })
    }

    // DeFi explorer
    if (data.defi?.totalProtocolsUsed && data.defi.totalProtocolsUsed >= 3) {
      milestones.push({
        type: "protocol_explorer",
        title: "DeFi Explorer",
        description: "Used multiple DeFi protocols",
        date: new Date(),
        icon: "zap",
        rarity: "rare",
      })
    }

    // NFT collector
    if (data.nfts?.totalNFTsMinted && data.nfts.totalNFTsMinted >= 5) {
      milestones.push({
        type: "nft_count",
        title: "NFT Collector",
        description: "Minted multiple NFTs",
        date: new Date(),
        icon: "crown",
        rarity: "legendary",
      })
    }

    return milestones
  }

  calculateChainScore(data: Partial<OnchainWrappedData>): number {
    // Network percentile baselines (these would ideally come from a database)
    // For now using reasonable estimates for Base network
    const NETWORK_PERCENTILES = {
      p10_tx_value: 0.001, // ETH
      p20_tx_value: 0.01,
      p75_tx_count: 50,
    }

    // === HARD PRE-FILTERS ===

    // 1. Wallet Age Floor
    let walletAgePenalty = 1.0
    if (data.summary?.firstTransactionDate) {
      const walletAgedays = Math.floor(
        (Date.now() - data.summary.firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (walletAgedays < 30) {
        walletAgePenalty = 0.2 // Cap at 20% of score
      }
    }

    // 2. Concentration Penalty
    let concentrationPenalty = 1.0
    const totalTx = data.transactions?.totalTransactions || 0
    const totalVolume = Number.parseFloat(data.transactions?.totalValueTransferredUSD || "0")

    if (data.defi?.topProtocols && data.defi.topProtocols.length > 0) {
      const topProtocolTx = data.defi.topProtocols[0]?.interactionCount || 0
      const topProtocolVolume = Number.parseFloat(data.defi.topProtocols[0]?.totalVolumeUSD || "0")

      if (totalTx > 0 && (topProtocolTx / totalTx > 0.7 || topProtocolVolume / totalVolume > 0.7)) {
        concentrationPenalty = 0.75
      }
    }

    // 3. Wash Spam Filter
    let washSpamPenalty = 1.0
    const transactions = data.transactions?.totalTransactions || 0
    // Calculate median tx value (simplified - would need full tx list for true median)
    const avgTxValue = totalVolume / Math.max(1, transactions)

    if (avgTxValue < NETWORK_PERCENTILES.p10_tx_value && transactions > NETWORK_PERCENTILES.p75_tx_count) {
      washSpamPenalty = 0.6
    }

    // === SCORE COMPONENTS ===

    const componentScores = {
      consistency: 0,
      intent: 0,
      gravity: 0,
      breadth: 0,
      cost: 0,
      social: 0,
    }

    // 1. CONSISTENCY OVER TIME (25 points)
    if (data.summary) {
      const activeDays = data.summary.totalDaysActive || 0
      const longestStreak = data.summary.longestStreakDays || 0

      // Active days: 18 points max (log scale)
      const activeDaysScore = Math.min(18, Math.log10(activeDays + 1) * 6)

      // Longest streak: 7 points max (log scale)
      const streakScore = Math.min(7, Math.log10(longestStreak + 1) * 3)

      componentScores.consistency = activeDaysScore + streakScore
    }

    // 2. TRANSACTION INTENT (20 points)
    if (data.transactions) {
      const txCount = data.transactions.totalTransactions
      const medianTxValue = totalVolume / Math.max(1, txCount) // Simplified median

      // Log-scaled tx count percentile (assume percentile = log scale)
      const txCountPercentile = Math.min(1, Math.log10(txCount + 1) / Math.log10(1000))

      // Median tx value percentile (relative to network baseline)
      const medianValuePercentile = Math.min(1, medianTxValue / 100) // Simplified

      let intentScore = 0.6 * txCountPercentile * 20 + 0.4 * medianValuePercentile * 20

      // Hard rule: cap at 8 points if median value < p20
      if (medianTxValue < NETWORK_PERCENTILES.p20_tx_value) {
        intentScore = Math.min(8, intentScore)
      }

      componentScores.intent = intentScore
    }

    // 3. ECONOMIC GRAVITY (15 points)
    if (data.transactions) {
      const totalVolumeUSD = Number.parseFloat(data.transactions.totalValueTransferredUSD || "0")
      const biggestTxUSD = Number.parseFloat(data.transactions.largestTransaction?.valueUSD || "0")

      // Total volume: 9 points max (log scale percentile)
      const volumeScore = Math.min(9, (Math.log10(totalVolumeUSD + 1) / Math.log10(1000000)) * 9)

      // Biggest transaction: 6 points max (log scale percentile)
      const bigTxScore = Math.min(6, (Math.log10(biggestTxUSD + 1) / Math.log10(100000)) * 6)

      componentScores.gravity = volumeScore + bigTxScore
    }

    // 4. PROTOCOL BREADTH (15 points)
    if (data.defi) {
      const protocols = data.defi.topProtocols || []
      const categories = new Set<string>()

      protocols.forEach((p) => {
        if (p.category) {
          categories.add(p.category.toLowerCase())
        }
      })

      // Max 3 points per category, 15 points total
      componentScores.breadth = Math.min(15, categories.size * 3)
    }

    // 5. NETWORK COST CONTRIBUTION (15 points)
    if (data.summary && data.transactions) {
      const gasSpent = Number.parseFloat(data.summary.totalGasSpentUSD || "0")
      const totalVolume = Number.parseFloat(data.transactions.totalValueTransferredUSD || "0")

      // Gas spent percentile: up to 9 points
      const gasPercentile = Math.min(1, Math.log10(gasSpent + 1) / Math.log10(1000))
      const gasScore = gasPercentile * 9

      // Gas efficiency (volume per gas): up to 6 points
      const efficiency = totalVolume / Math.max(0.01, gasSpent)
      const efficiencyScore = Math.min(6, Math.log10(efficiency + 1) * 2)

      componentScores.cost = gasScore + efficiencyScore
    }

    // 6. SOCIAL GRAPH REALITY (10 points)
    if (data.social) {
      const uniqueWallets = data.social.uniqueWalletsInteractedWith || 0
      const topInteractions = data.social.topRecipients || []

      // Base score from unique wallets (log scale)
      let socialScore = Math.min(10, Math.log10(uniqueWallets + 1) * 3)

      // Penalty for repeat counterparty concentration
      if (topInteractions.length > 0 && uniqueWallets > 0) {
        const topInteractionCount = topInteractions[0]?.interactionCount || 0
        const repeatRatio = topInteractionCount / uniqueWallets

        if (repeatRatio > 0.6) {
          socialScore *= 1 - (repeatRatio - 0.6) * 2 // Decay penalty
        }
      }

      componentScores.social = Math.max(0, socialScore)
    }

    // Sum all components
    let rawScore = Object.values(componentScores).reduce((a, b) => a + b, 0)

    // === SCORE STABILIZERS ===

    // Inactivity Decay
    if (data.summary?.lastTransactionDate) {
      const daysSinceActivity = Math.floor(
        (Date.now() - data.summary.lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24),
      )

      if (daysSinceActivity > 30) {
        const decayFactor = Math.min(0.15, ((daysSinceActivity - 30) / 365) * 0.15)
        rawScore *= 1 - decayFactor
      }
    }

    // Apply all penalties
    let finalScore = rawScore * walletAgePenalty * concentrationPenalty * washSpamPenalty

    // Clamp to 0-100
    finalScore = Math.min(100, Math.max(0, Math.round(finalScore)))

    console.log("[v0] Score calculation:", {
      components: componentScores,
      rawScore,
      penalties: {
        walletAge: walletAgePenalty,
        concentration: concentrationPenalty,
        washSpam: washSpamPenalty,
      },
      finalScore,
    })

    return finalScore
  }
}

export async function computeWrappedAnalytics(rawData: any): Promise<OnchainWrappedData> {
  console.log("[v0] Computing analytics for raw data:", {
    address: rawData.address,
    transactionsCount: rawData.transactions?.length || 0,
    tokenBalancesCount: rawData.tokenBalances?.length || 0,
    nftBalancesCount: rawData.nftBalances?.length || 0,
    tokenTransfersCount: rawData.tokenTransfers?.length || 0,
    nftTransfersCount: rawData.nftTransfers?.length || 0,
  })

  try {
    const analytics = new WrappedAnalytics()

    const transactions: WalletTransaction[] = rawData.transactions || []
    const tokenTransfers: TokenTransfer[] = rawData.tokenTransfers || []
    const nftTransfers: NFTTransfer[] = rawData.nftTransfers || []
    const nftBalances: NFTBalance[] = rawData.nftBalances || []

    const timeRange: TimeRange = {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      label: "2025",
    }

    // This ensures we use the connected wallet address, not transaction addresses
    const address = rawData.address || "0x0000000000000000000000000000000000000000"

    if (!rawData.address) {
      console.warn("[v0] No address in rawData, using fallback")
    }

    const result = await analytics.computeWrapped(
      address,
      transactions,
      tokenTransfers,
      nftTransfers,
      nftBalances,
      timeRange,
    )

    console.log("[v0] Analytics computed successfully:", {
      walletAddress: result.walletAddress,
      totalTransactions: result.transactions.totalTransactions,
      chainScore: result.summary.chainScore,
      nftsData: {
        totalMinted: result.nfts.totalNFTsMinted,
        totalReceived: result.nfts.totalNFTsReceived,
        uniqueCollections: result.nfts.uniqueCollectionsOwned,
      },
    })

    return result
  } catch (error) {
    console.error("[v0] Error computing analytics:", error)
    const fallbackAddress = rawData.address || "0x0000000000000000000000000000000000000000"
    return {
      walletAddress: fallbackAddress,
      timeRange: {
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        label: "2025",
      },
      summary: {
        firstTransactionDate: new Date(),
        lastTransactionDate: new Date(),
        totalDaysActive: 0,
        mostActiveDayOfWeek: "N/A",
        mostActiveMonth: "N/A",
        longestStreakDays: 0,
        totalGasSpentETH: "0",
        totalGasSpentUSD: "0",
        chainScore: 0,
      },
      transactions: {
        totalTransactions: rawData.transactions?.length || 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        averageGasPrice: "0",
        totalValueTransferredUSD: "0",
        transactionsByMonth: [],
        mostActiveDay: { date: "", transactionCount: 0, volumeUSD: "0" },
        transactionTypes: {
          transfers: 0,
          swaps: 0,
          nftMints: 0,
          nftTrades: 0,
          defiInteractions: 0,
          contractDeployments: 0,
          other: 0,
        },
        largestTransaction: {
          valueUSD: "0.00",
          type: "no transactions",
          hash: "",
        },
      },
      tokens: {
        uniqueTokensInteracted: 0,
        totalTokensReceived: 0,
        totalTokensSent: 0,
        netTokenFlow: 0,
        topTokensByVolume: [],
        topTokensByTransactionCount: [],
        favoriteToken: { symbol: "N/A", name: "None", address: "", volumeUSD: "0", transactionCount: 0 },
        rareDappInteractions: [],
      },
      nfts: {
        totalNFTsMinted: 0,
        totalNFTsReceived: 0,
        totalNFTsSent: 0,
        totalNFTsBurned: 0,
        uniqueCollectionsOwned: 0,
        uniqueCollectionsInteracted: 0,
        topCollections: [],
        firstNFT: null,
        mostRecentNFT: null,
        estimatedNFTPortfolioValueUSD: "0",
      },
      defi: {
        totalProtocolsUsed: 0,
        topProtocols: [],
        totalValueSwapped: "0",
        totalLiquidityProvided: "0",
        totalYieldEarned: "0",
        riskProfile: "conservative",
      },
      social: {
        uniqueWalletsInteractedWith: 0,
        topRecipients: [],
        topSenders: [],
        communityScore: 0,
      },
      milestones: [],
      topCounterparties: [],
    }
  }
}
