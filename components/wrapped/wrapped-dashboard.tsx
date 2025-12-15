"use client"

import { useAccount } from "wagmi"
import { useWrappedData } from "@/lib/wrapped/hooks/use-wrapped-data"
import { Loader2 } from "lucide-react"
import { ChainScoreCard } from "@/components/wrapped/dashboard/chain-score-card"
import { SummaryCard } from "@/components/wrapped/dashboard/summary-card"
import { TimelineCard } from "@/components/wrapped/dashboard/timeline-card"
import { FooterCard } from "@/components/wrapped/dashboard/footer-card"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { saveToLeaderboard } from "@/lib/wrapped/utils/leaderboard"
import { useName } from "@coinbase/onchainkit/identity"
import { base } from "viem/chains"

interface WrappedDashboardProps {
  manualAddress?: string
}

export function WrappedDashboard({ manualAddress }: WrappedDashboardProps) {
  const { address: connectedAddress } = useAccount()

  const address = manualAddress || connectedAddress

  const { data: wrappedData, isLoading, error, refetch } = useWrappedData(address)

  const { data: basename } = useName({
    address: address as `0x${string}`,
    chain: base,
  })

  useEffect(() => {
    console.log("[v0] useEffect triggered:", {
      hasWrappedData: !!wrappedData,
      hasAddress: !!address,
      chainScore: wrappedData?.summary?.chainScore,
      basename,
    })

    if (wrappedData && address && wrappedData.summary?.chainScore !== undefined) {
      const getSkillLevel = (score: number) => {
        if (score >= 80) return "Elite"
        if (score >= 60) return "Skilled"
        if (score >= 40) return "Active"
        return "Beginner"
      }

      const skillLevel = getSkillLevel(wrappedData.summary.chainScore)

      console.log("[v0] Attempting to save to leaderboard...")

      saveToLeaderboard(
        address,
        wrappedData.summary.chainScore,
        skillLevel,
        wrappedData.transactions?.totalTransactions || 0,
        Number.parseFloat(wrappedData.transactions?.totalValueTransferredUSD || "0"),
        wrappedData.summary?.totalDaysActive || 0,
        basename || undefined,
      ).catch((error) => {
        console.error("[v0] Failed to save to leaderboard:", error)
      })
    }
  }, [wrappedData, address, basename])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-blueprint-fade">
          <Loader2 className="w-12 h-12 text-foreground animate-spin mx-auto" strokeWidth={2.5} />
          <div className="space-y-2">
            <p className="text-2xl font-bold uppercase tracking-wider">ANALYZING DATA</p>
            <p className="text-sm font-mono uppercase tracking-wider opacity-60">COMPILING BLOCKCHAIN METRICS...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !wrappedData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="blueprint-card p-10 text-center space-y-6 max-w-md animate-blueprint-fade">
          <div className="w-20 h-20 mx-auto border-4 border-foreground flex items-center justify-center bg-crosshatch opacity-20">
            <span className="text-4xl font-bold">!</span>
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold uppercase tracking-wide">DATA UNAVAILABLE</p>
            <p className="text-sm font-mono uppercase tracking-wider opacity-70">
              {error?.message || "FAILED TO FETCH WRAPPED DATA"}
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            className="mt-6 border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground uppercase font-bold tracking-wider"
          >
            RETRY CONNECTION
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        <ChainScoreCard key={address} data={wrappedData} address={address} isLoading={isLoading} />
        <SummaryCard data={wrappedData} />
        <TimelineCard data={wrappedData} />
        <FooterCard address={address} data={wrappedData} />
      </div>
    </div>
  )
}
