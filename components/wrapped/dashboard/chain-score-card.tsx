"use client"

import { useEffect, useState } from "react"
import type { WrappedData } from "@/types/onchain-wrapped"
import { Trophy, TrendingUp, Activity, Flame, Calendar, ArrowDownRight, Zap, Users, DollarSign } from "lucide-react"
import { useName } from "@coinbase/onchainkit/identity"
import { base } from "viem/chains"

interface ChainScoreCardProps {
  data: WrappedData
  address?: string
  isLoading?: boolean
}

export function ChainScoreCard({ data, address, isLoading }: ChainScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const chainScore = data.summary?.chainScore || 0

  const { data: baseName, isLoading: isLoadingBaseName } = useName({
    address: address as `0x${string}`,
    chain: base,
  })

  console.log("[v0] Base Name display:", {
    address,
    baseName,
    isLoading: isLoadingBaseName,
  })

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    } else if (value >= 1) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    } else if (value >= 0.01) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    } else {
      return value.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 2 })
    }
  }

  useEffect(() => {
    if (isLoading) return

    const duration = 1500
    const steps = 60
    const increment = chainScore / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= chainScore) {
        setAnimatedScore(chainScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [chainScore, isLoading])

  const getScoreLabel = (score: number) => {
    if (score >= 91) return "LEGENDARY"
    if (score >= 71) return "ELITE"
    if (score >= 51) return "EXPERT"
    if (score >= 31) return "SKILLED"
    if (score >= 11) return "BEGINNER"
    return "NPC"
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-foreground"
    if (score >= 50) return "text-foreground/90"
    return "text-foreground/70"
  }

  const quickStats = [
    {
      label: "TRANSACTIONS",
      value: data.transactions?.totalTransactions || 0,
      icon: Activity,
    },
    {
      label: "TOP TOKEN TRADED",
      value: data.tokens?.topTokensByTransactionCount?.[0]?.symbol || "N/A",
      suffix: ` (${data.tokens?.topTokensByTransactionCount?.[0]?.transactionCount || 0}x)`,
      icon: TrendingUp,
    },
    {
      label: "TOTAL VOLUME",
      value: Number.parseFloat(data.transactions?.totalValueTransferredUSD || "0"),
      prefix: "$",
      icon: ArrowDownRight,
    },
    {
      label: "GAS SPENT",
      value: Number.parseFloat(data.summary?.totalGasSpentUSD || "0"),
      prefix: "$",
      icon: Flame,
    },
    {
      label: "ACTIVE DAYS",
      value: `${data.summary?.totalDaysActive || 0}/365`,
      icon: Calendar,
    },
    {
      label: "MOST ACTIVE DAY",
      value: data.summary?.mostActiveDayOfWeek || "N/A",
      description: `${data.transactions?.mostActiveDay?.transactionCount || 0} txs`,
      icon: Zap,
    },
    {
      label: "TOP PROTOCOL",
      value: data.defi?.topProtocols?.[0]?.protocolName || "N/A",
      description: `${data.defi?.topProtocols?.[0]?.interactionCount || 0} uses`,
      icon: TrendingUp,
    },
    {
      label: "BIGGEST TX",
      value: data.transactions?.largestTransaction?.valueUSD
        ? `$${formatCurrency(Number.parseFloat(data.transactions.largestTransaction.valueUSD))}`
        : "N/A",
      description: data.transactions?.largestTransaction?.type || "transaction",
      icon: DollarSign,
    },
    {
      label: "WALLETS INTERACTED",
      value: data.social?.uniqueWalletsInteractedWith || 0,
      description: "unique addresses",
      icon: Users,
    },
  ]

  if (isLoading) {
    return (
      <div
        className="blueprint-card rounded-lg p-10 animate-blueprint-fade relative overflow-hidden"
        style={{ animationDelay: "50ms" }}
      >
        <div className="relative z-10 space-y-8">
          <div className="relative pb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-auto bg-foreground/10 rounded animate-pulse" />
                <span className="font-black uppercase tracking-wider text-7xl bg-foreground/10 rounded animate-pulse h-14 w-24" />
              </div>
              <h1 className="text-8xl font-black uppercase tracking-wider text-outlined-hatched leading-none mt-2 bg-foreground/10 rounded animate-pulse h-16 w-64" />
              <div className="inline-flex border-2 border-foreground/30 px-4 py-2 bg-background/10 rounded-lg">
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-foreground/30 h-4 w-32 bg-foreground/10 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-8 relative z-20">
            {/* Chain Score skeleton */}
            <div className="col-span-1 lg:col-span-5 border-2 border-foreground/30 rounded-lg p-5 relative bg-background space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 border-4 border-foreground/30 bg-hatch/50 rounded animate-pulse" />
                <div className="text-right">
                  <div className="h-4 w-16 bg-foreground/10 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-widest opacity-60 text-lg h-4 w-32 bg-foreground/10 rounded animate-pulse" />
                <div className="flex items-end gap-6">
                  <div className="text-6xl font-black tracking-wide leading-none h-16 w-20 bg-foreground/10 rounded animate-pulse" />
                  <div className="pb-2 flex items-center gap-2">
                    <span className="text-2xl font-black opacity-40">|</span>
                    <p className="text-xl font-bold uppercase tracking-wider opacity-80 h-6 w-16 bg-foreground/10 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="h-4 border-2 border-foreground/30 rounded overflow-hidden relative">
                <div className="h-full w-1/4 bg-foreground/20 animate-pulse" />
              </div>
              <p className="text-xs font-mono opacity-70 border-l-2 border-foreground/30 pl-3 leading-relaxed h-3 w-64 bg-foreground/10 rounded animate-pulse" />
            </div>

            <div className="col-span-1 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                <div
                  key={index}
                  className="border-2 border-foreground rounded-lg p-4 bg-background hover:bg-hatch/30 transition-all relative group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground/20 group-hover:bg-foreground/40 transition-colors" />
                  <div className="flex flex-col gap-2 pl-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-foreground/10 rounded animate-pulse" />
                      <span className="text-xs font-mono font-bold uppercase tracking-widest leading-tight h-3 w-20 bg-foreground/10 rounded animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xl font-black block h-6 w-16 bg-foreground/10 rounded animate-pulse" />
                      <p className="text-xs font-mono opacity-50 h-3 w-24 bg-foreground/10 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      data-wrapped-card
      className="blueprint-card rounded-lg p-4 sm:p-6 lg:p-10 animate-blueprint-fade relative overflow-hidden"
      style={{ animationDelay: "50ms" }}
    >
      {/* Subtle radial gradient from top-left */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 15% 20%, var(--foreground) 0%, transparent 50%),
            radial-gradient(circle at 85% 80%, var(--foreground) 0%, transparent 45%)
          `,
        }}
      />

      {/* Diagonal subtle gradient sweep */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none z-0"
        style={{
          background: `
            linear-gradient(135deg, var(--foreground) 0%, transparent 40%, transparent 60%, var(--foreground) 100%)
          `,
        }}
      />

      {/* Asymmetric accent gradients */}
      <div
        className="absolute top-0 right-0 w-1/3 h-2/3 opacity-[0.12] pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at top right, var(--foreground) 0%, transparent 60%)`,
        }}
      />

      <div
        className="absolute bottom-0 left-0 w-2/5 h-1/2 opacity-[0.10] pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at bottom left, var(--foreground) 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 space-y-8">
        <div className="relative pb-8">
          <div className="space-y-4">
            <div>
              {/* Base logo + "base 2025" */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Base logo */}
                <div className="h-10 sm:h-14 w-auto">
                  <svg
                    viewBox="0 0 1280 323.84"
                    className="h-full w-auto fill-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M447.23,323.58c-25.22,0-49.54-9.22-63.87-33.54h-8.32v26.62h-57.34V0h57.34v115.2h8.32c14.72-25.22,42.24-34.94,67.07-34.94,61.95,0,103.81,49.54,103.81,119.3s-45.95,123.9-107.01,123.9v.13ZM434.82,272.26c35.33,0,60.54-28.93,60.54-70.27s-25.73-70.27-60.54-70.27-59.65,27.52-59.65,70.27,25.22,70.27,59.65,70.27ZM660.22,323.58c-44.03,0-79.87-26.62-79.87-70.27s39.42-67.97,87.17-72.96l67.46-6.91v-12.8c0-19.71-16.13-33.54-44.54-33.54s-42.75,11.9-47.74,29.82h-55.04c5.5-43.65,41.73-76.67,102.78-76.67s97.79,28.42,97.79,83.97v112c0,14.21,1.41,33.92,2.3,39.42v.9h-55.04c-.51-7.81-.51-15.1-.51-22.91h-8.32c-14.21,22.91-39.04,29.82-66.56,29.82l.13.13ZM675.84,280.45c37.63,0,59.26-28.42,59.26-57.34v-11.52l-50.56,6.02c-31.23,3.71-46.34,12.8-46.34,33.02s15.62,29.82,37.63,29.82ZM926.08,323.58c-57.86,0-99.2-28.93-105.6-74.37h56.45c6.4,20.22,27.52,28.93,49.54,28.93s40.83-9.6,40.83-26.62-17.41-21.63-41.34-25.73l-24.32-4.1c-45.95-7.81-74.37-27.14-74.37-68.35s39.42-72.96,94.08-72.96,88.58,24.83,98.18,67.97h-55.04c-6.4-17.02-23.42-23.81-42.75-23.81s-38.53,10.11-38.53,24.32,11.9,19.33,36.74,23.42l24.32,4.1c44.54,7.3,78.46,25.73,78.46,70.27s-40.45,77.18-96.9,77.18l.26-.26ZM1166.59,323.58c-70.66,0-117.5-48.26-117.5-122.11s49.54-121.22,118.02-121.22,112.9,53.25,112.9,123.52v10.11h-174.85c2.82,38.14,29.44,60.54,61.57,60.54s42.75-9.22,50.56-25.22h58.75c-11.9,43.14-54.66,74.37-109.31,74.37h-.13ZM1223.94,175.87c-4.61-30.72-28.93-48.64-57.34-48.64s-55.04,17.41-60.54,48.64h118.02-.13Z" />
                    <path d="M13.82,316.8c-9.22,0-13.82-4.61-13.82-13.82V100.99c0-9.22,4.61-13.82,13.82-13.82h201.98c9.22,0,13.82,4.61,13.82,13.82v201.98c0,9.22-4.61,13.82-13.82,13.82H13.82Z" />
                  </svg>
                </div>

                {/* "2025" text - matched to logo height */}
                <span className="font-black uppercase tracking-wider leading-none text-5xl sm:text-7xl">2025</span>
              </div>

              {/* Second line: "Wrapped" - sized to match combined width above */}
              <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-wider text-outlined-hatched leading-none mt-2">
                Wrapped
              </h1>
            </div>

            {/* Address badge - aligned with left text, more prominent */}
            {address && (
              <div className="inline-flex border-2 border-foreground px-4 py-2 bg-foreground/10 rounded-lg">
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                  {isLoadingBaseName ? (
                    <span className="opacity-50">Loading...</span>
                  ) : baseName ? (
                    <span className="lowercase">{baseName}</span>
                  ) : (
                    formatAddress(address)
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-8 relative z-20">
        {/* Chain Score - Compact version spans 5 columns */}
        <div className="col-span-1 lg:col-span-5 border-2 border-foreground rounded-lg p-5 relative bg-background space-y-4">
          {/* Construction markers */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-2 border-foreground bg-background rotate-45" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-2 border-foreground bg-background rotate-45" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-2 border-foreground bg-background rotate-45" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-2 border-foreground bg-background rotate-45" />

          {/* Score icon and label - horizontal layout */}
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 border-4 border-foreground flex items-center justify-center bg-hatch relative">
              <Trophy className="w-8 h-8" strokeWidth={2.5} />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-foreground border-2 border-foreground flex items-center justify-center rotate-12">
                <TrendingUp className="w-4 h-4 text-background" strokeWidth={3} />
              </div>
            </div>
            <div className="text-right"></div>
          </div>

          {/* Score display - compact */}
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-widest opacity-80 text-lg">ONCHAIN SCORE</p>
            <div className="flex items-end gap-6">
              <div className={`text-6xl font-black tracking-wide leading-none ${getScoreColor(chainScore)}`}>
                {animatedScore}/100
              </div>
              <div className="pb-2 flex items-center gap-2">
                <span className="text-2xl font-black opacity-40">|</span>
                <p className="text-xl font-bold uppercase tracking-wider opacity-80">{getScoreLabel(chainScore)}</p>
              </div>
            </div>
          </div>

          {/* Score bar - compact */}
          <div>
            <div className="h-4 border-2 border-foreground rounded overflow-hidden relative">
              <div
                className="h-full bg-crosshatch-dense transition-all duration-1500 ease-out relative"
                style={{ width: `${animatedScore}%` }}
              >
                <div className="absolute right-0 top-0 h-full w-1 bg-foreground" />
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs font-mono opacity-60">
              <span>0</span>
              <span className="opacity-40">SCORE_RANGE</span>
              <span>100</span>
            </div>
          </div>

          {/* Description - compact */}
          <p className="text-xs font-mono opacity-70 border-l-2 border-foreground/30 pl-3 leading-relaxed">
            Based on transaction frequency, protocol diversity, and network contribution
          </p>
        </div>

        <div className="col-span-1 lg:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {quickStats.map((stat, index) => (
            <div
              key={stat.label}
              className="border-2 border-foreground rounded-lg p-2 sm:p-4 bg-background hover:bg-hatch transition-all relative group"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground/20 group-hover:bg-foreground/40 transition-colors" />
              <div className="flex flex-col gap-2 pl-2">
                <div className="flex items-center gap-2">
                  <stat.icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest leading-tight">
                    {stat.label}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xl font-black block">
                    {stat.prefix}
                    {typeof stat.value === "string"
                      ? stat.value
                      : stat.suffix === "%"
                        ? (stat.value as number).toFixed(1)
                        : stat.prefix === "$"
                          ? formatCurrency(stat.value as number)
                          : (stat.value as number).toLocaleString()}
                    {stat.suffix}
                  </span>
                  {stat.description && <p className="text-xs font-mono opacity-50">{stat.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
