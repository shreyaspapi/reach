"use client"

import type { WrappedData } from "@/types/onchain-wrapped"
import { ArrowUpRight, Repeat, FileCode, ImageIcon } from "lucide-react"

interface TimelineCardProps {
  data: WrappedData
}

export function TimelineCard({ data }: TimelineCardProps) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

  const monthlyData = data.transactions?.transactionsByMonth || []
  const txTypes = data.transactions?.transactionTypes

  const activities = [
    { label: "TRANSFERS", value: txTypes?.transfers || 0, icon: ArrowUpRight, color: "bg-crosshatch-dense" },
    { label: "SWAPS", value: txTypes?.swaps || 0, icon: Repeat, color: "bg-hatch" },
    { label: "NFT MINTS", value: txTypes?.nftMints || 0, icon: ImageIcon, color: "bg-crosshatch-light" },
    { label: "DEFI", value: txTypes?.defiInteractions || 0, icon: FileCode, color: "bg-crosshatch" },
  ]

  const monthlyActivity = months.map((month, index) => {
    const found = monthlyData.find((m) => {
      const monthNum = new Date(m.month + "-01").getMonth()
      return monthNum === index
    })
    return {
      month,
      transactions: found ? found.transactionCount : 0,
    }
  })

  const maxTx = Math.max(...monthlyActivity.map((m) => m.transactions), 1)
  const totalActivities = activities.reduce((sum, a) => sum + a.value, 0) || 1
  // </CHANGE>

  return (
    null
  )
}
