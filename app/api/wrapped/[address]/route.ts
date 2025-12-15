import { type NextRequest, NextResponse } from "next/server"
import { AlchemyDataService } from "@/lib/wrapped/api/alchemy-service"
import { GoldRushDataService } from "@/lib/wrapped/api/goldrush-service"
import { computeWrappedAnalytics } from "@/lib/wrapped/analytics/wrapped-analytics"
import type { IBlockchainDataService } from "@/lib/wrapped/api/data-service.interface"
import { createPublicClient, http } from "viem"
import { namehash } from "viem/ens"
import { base } from "viem/chains"

async function getDataService(): Promise<IBlockchainDataService> {
  if (process.env.ALCHEMY_API_KEY && process.env.ALCHEMY_API_KEY.length >= 30) {
    return new AlchemyDataService()
  } else if (process.env.GOLDRUSH_API_KEY && process.env.GOLDRUSH_API_KEY.length > 0) {
    return new GoldRushDataService()
  } else {
    return new GoldRushDataService()
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address: rawAddress } = await params

    if (!rawAddress) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    let address = rawAddress

    // Check if it's a Base Name (ends with .base.eth)
    const isBaseName = rawAddress.toLowerCase().endsWith(".base.eth")

    if (isBaseName) {
      console.log("[Wrapped] Resolving Base Name:", rawAddress)
      
      try {
        // Normalize the Base Name to lowercase (simple normalization)
        const normalizedName = rawAddress.toLowerCase().trim()
        
        // Create a public client for Base
        const publicClient = createPublicClient({
          chain: base,
          transport: http(),
        })

        // Base Name Resolver contract address
        const L2_RESOLVER_ADDRESS = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD" as `0x${string}`
        
        // Get the namehash for the Base Name
        const node = namehash(normalizedName)
        
        // Call the resolver contract to get the address
        const resolvedAddress = await publicClient.readContract({
          address: L2_RESOLVER_ADDRESS,
          abi: [
            {
              inputs: [{ name: "node", type: "bytes32" }],
              name: "addr",
              outputs: [{ name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "addr",
          args: [node],
        })

        if (!resolvedAddress || resolvedAddress === "0x0000000000000000000000000000000000000000") {
          return NextResponse.json(
            { error: `Base Name "${rawAddress}" could not be resolved to an address` },
            { status: 400 }
          )
        }

        address = resolvedAddress as string
        console.log("[Wrapped] Base Name resolved to:", address)
      } catch (error) {
        console.error("[Wrapped] Error resolving Base Name:", error)
        return NextResponse.json(
          { error: `Failed to resolve Base Name "${rawAddress}". Please try using the wallet address directly.` },
          { status: 400 }
        )
      }
    } else {
      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 })
      }
    }

    console.log("[Wrapped] Fetching wrapped data for address:", address)

    const timeRange = {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      label: "2025",
    }

    const dataService = await getDataService()

    const withTimeout = (promise: Promise<any>, timeoutMs: number, label: string): Promise<any> => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
      })
      return Promise.race([promise, timeoutPromise])
    }

    console.log("[Wrapped] Starting parallel data fetching...")

    const fetchPromises = [
      withTimeout(dataService.getTransactions(address, timeRange), 30000, "Transactions").catch((err) => {
        console.warn("[Wrapped] Transactions fetch failed:", err.message)
        return []
      }),
      withTimeout(dataService.getTokenBalances(address), 15000, "Token Balances").catch((err) => {
        console.warn("[Wrapped] Token balances fetch failed:", err.message)
        return []
      }),
      withTimeout(dataService.getNFTBalances(address), 15000, "NFT Balances").catch((err) => {
        console.warn("[Wrapped] NFT balances fetch failed:", err.message)
        return []
      }),
      withTimeout(
        (async () => {
          const alchemyService = new AlchemyDataService()
          try {
            const result = await alchemyService.getTokenTransfers(address, timeRange)
            if (result.length > 0) return result
          } catch (error) {
            console.warn("[Wrapped] Alchemy token transfers failed, trying fallback:", (error as Error).message)
          }
          return await dataService.getTokenTransfers(address, timeRange)
        })(),
        20000,
        "Token Transfers",
      ).catch((err) => {
        console.warn("[Wrapped] Token transfers fetch failed:", err.message)
        return []
      }),
      withTimeout(dataService.getNFTTransfers(address, timeRange), 20000, "NFT Transfers").catch((err) => {
        console.warn("[Wrapped] NFT transfers fetch failed:", err.message)
        return []
      }),
    ]

    const [transactions, tokenBalances, nftBalances, tokenTransfers, nftTransfers] = await Promise.all(fetchPromises)

    console.log("[Wrapped] Data fetching completed")

    console.log(
      "[Wrapped] Data fetched - Transactions:",
      transactions.length,
      "Tokens:",
      tokenBalances.length,
      "NFTs:",
      nftBalances.length,
      "Token Transfers:",
      tokenTransfers.length,
      "NFT Transfers:",
      nftTransfers.length,
    )

    const rawData = {
      address,
      transactions,
      tokenBalances,
      nftBalances,
      tokenTransfers,
      nftTransfers,
    }

    const analyticsData = await computeWrappedAnalytics(rawData)

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("[Wrapped] Error in wrapped API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch wrapped data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

