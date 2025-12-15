"use client"

import { useEffect, useState, useRef } from "react"
import type { WrappedData } from "@/types/onchain-wrapped"
import { ArrowUpRight, ArrowDownRight, Flame, Calendar, Activity, Coins, TrendingUp, BarChart3 } from "lucide-react"

interface SummaryCardProps {
  data: WrappedData
}

// Animated counter component
function AnimatedCounter({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(value * easeOut)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  const formatted =
    decimals > 0
      ? displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : Math.floor(displayValue).toLocaleString()

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

export function SummaryCard({ data }: SummaryCardProps) {
  const tokens = data.tokens?.topTokensByVolume || []
  const topTokensHeld = tokens.slice(0, 3)

  // Calculate most bought (highest transaction count)
  const mostBought = [...tokens].sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 3)

  // Calculate highest ROI (simplified - using volume as proxy)
  const highestROI = [...tokens]
    .sort((a, b) => Number.parseFloat(b.volumeUSD) - Number.parseFloat(a.volumeUSD))
    .slice(0, 3)

  // Calculate total volume
  const totalVolume = tokens.reduce((sum, token) => sum + Number.parseFloat(token.volumeUSD), 0)

  const stats = [
    {
      label: "TOTAL TRANSACTIONS",
      value: data.transactions?.totalTransactions || 0,
      icon: Activity,
      pattern: "bg-crosshatch",
    },
    {
      label: "SUCCESS RATE",
      value: data.transactions?.totalTransactions
        ? ((data.transactions?.successfulTransactions || 0) / data.transactions.totalTransactions) * 100
        : 0,
      suffix: "%",
      decimals: 1,
      icon: ArrowUpRight,
      pattern: "bg-hatch",
    },
    {
      label: "TOTAL VOLUME",
      value: Number.parseFloat(data.transactions?.totalValueTransferredUSD || "0"),
      prefix: "$",
      icon: ArrowDownRight,
      pattern: "bg-crosshatch-light",
    },
    {
      label: "GAS SPENT",
      value: Number.parseFloat(data.summary?.totalGasSpentUSD || "0"),
      prefix: "$",
      decimals: 2,
      icon: Flame,
      pattern: "bg-hatch",
    },
    {
      label: "ACTIVE DAYS",
      value: data.summary?.totalDaysActive || 0,
      icon: Calendar,
      pattern: "bg-crosshatch",
    },
  ]
  // </CHANGE>

  return (
    null
  )
}
