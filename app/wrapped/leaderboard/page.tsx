"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Trophy, TrendingUp, Activity, DollarSign } from "lucide-react"
import { LeaderboardEntry } from "@/lib/wrapped/utils/leaderboard"

export default function WrappedLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/wrapped-leaderboard?limit=100")
        const data = await res.json()

        if (data.success) {
          setLeaderboard(data.data)
        } else {
          setError(data.error || "Failed to load leaderboard")
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err)
        setError("Failed to load leaderboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getSkillBadgeColor = (skillLevel: string) => {
    switch (skillLevel.toLowerCase()) {
      case "elite":
      case "legendary":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "expert":
        return "bg-purple-500/20 text-purple-500 border-purple-500/30"
      case "skilled":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
      case "active":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30"
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  return (
    <main className="min-h-screen bg-reach-paper">
      {/* Header */}
      <div className="border-b-2 border-reach-blue/20 bg-reach-paper/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/wrapped"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-reach-blue/30 bg-reach-paper px-3 py-2 font-mono text-xs uppercase tracking-widest text-reach-blue transition-all hover:border-reach-blue hover:bg-reach-blue/5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div>
                <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-reach-blue sm:text-4xl">
                  <Trophy className="h-8 w-8" />
                  2025 Wrapped Leaderboard
                </h1>
                <p className="mt-1 font-mono text-sm uppercase tracking-wider text-reach-blue/70">
                  Top Onchain Performers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-reach-blue/20 border-t-reach-blue"></div>
              <p className="mt-4 font-mono text-sm uppercase tracking-wider text-reach-blue/70">
                Loading leaderboard...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="max-w-md rounded-lg border-2 border-red-500/30 bg-red-500/5 p-8 text-center">
              <p className="font-mono text-sm uppercase tracking-wider text-red-500">{error}</p>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="max-w-md rounded-lg border-2 border-reach-blue/30 bg-reach-paper p-8 text-center">
              <Trophy className="mx-auto h-12 w-12 text-reach-blue/50" />
              <p className="mt-4 font-mono text-sm uppercase tracking-wider text-reach-blue/70">
                No entries yet. Be the first!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border-2 border-reach-blue/30 bg-reach-paper p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-reach-blue" />
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-reach-blue/70">
                      Total Participants
                    </p>
                    <p className="font-display text-2xl font-bold text-reach-blue">{leaderboard.length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border-2 border-reach-blue/30 bg-reach-paper p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-reach-blue" />
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-reach-blue/70">
                      Avg Chain Score
                    </p>
                    <p className="font-display text-2xl font-bold text-reach-blue">
                      {(leaderboard.reduce((sum, e) => sum + e.score, 0) / leaderboard.length).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border-2 border-reach-blue/30 bg-reach-paper p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-reach-blue" />
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-reach-blue/70">
                      Total Transactions
                    </p>
                    <p className="font-display text-2xl font-bold text-reach-blue">
                      {leaderboard.reduce((sum, e) => sum + e.total_transactions, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-hidden rounded-lg border-2 border-reach-blue/30 bg-reach-paper">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-reach-blue/30 bg-reach-blue/5">
                    <tr>
                      <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-reach-blue">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-reach-blue">
                        Address
                      </th>
                      <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-reach-blue">
                        Score
                      </th>
                      <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-reach-blue">
                        Level
                      </th>
                      <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-reach-blue">
                        Transactions
                      </th>
                      <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-reach-blue">
                        Volume
                      </th>
                      <th className="px-4 py-3 text-center font-mono text-xs uppercase tracking-wider text-reach-blue">
                        Active Days
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-reach-blue/10">
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.id || entry.address}
                        className="transition-colors hover:bg-reach-blue/5"
                      >
                        <td className="px-4 py-4">
                          <span className="font-display text-lg font-bold text-reach-blue">
                            {getRankBadge(index + 1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            {entry.basename ? (
                              <>
                                <span className="font-mono text-sm font-semibold text-reach-blue">
                                  {entry.basename}
                                </span>
                                <span className="font-mono text-xs text-reach-blue/50">
                                  {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                                </span>
                              </>
                            ) : (
                              <span className="font-mono text-sm text-reach-blue">
                                {entry.address.slice(0, 10)}...{entry.address.slice(-8)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-display text-xl font-bold text-reach-blue">
                            {entry.score.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ${getSkillBadgeColor(entry.skill_level)}`}
                          >
                            {entry.skill_level}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-mono text-sm text-reach-blue">
                            {entry.total_transactions.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-mono text-sm text-reach-blue">
                            ${entry.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-mono text-sm text-reach-blue">{entry.active_days}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
