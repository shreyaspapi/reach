// @ts-nocheck
/* eslint-disable */
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Trophy, Users, Wallet, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Campaign } from "@/lib/supabase"
import { StreamCounter } from "@/components/stream-counter"

export default function CampaignPage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params
    const [data, setData] = useState<any>(null)
    const [poolData, setPoolData] = useState<any>(null)
    const [poolAllocations, setPoolAllocations] = useState<any>(null)
    const [poolError, setPoolError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

    useEffect(() => {
        async function fetchData() {
            if (!id) return

            try {
                const res = await fetch(`/api/campaigns/${id}`)
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Campaign not found")
                    throw new Error("Failed to fetch campaign")
                }
                const json = await res.json()
                setData(json)

                // Fetch pool data if available
                if (json.campaign?.pool_address) {
                    try {
                        const poolRes = await fetch(`/api/campaigns/${id}/pool`)
                        if (poolRes.ok) {
                            const poolJson = await poolRes.json()
                            
                            // Try to get pool data from multiple sources
                            if (poolJson.poolData && !poolJson.poolData.error) {
                                // Use on-chain pool data (best source)
                                setPoolData(poolJson.poolData)
                            } else if (poolJson.graphData && !poolJson.graphData.error && poolJson.graphData.members) {
                                // Use The Graph data as fallback
                                const totalUnits = poolJson.graphData.members.reduce((sum, m) => sum + parseInt(m.units || "0"), 0).toString()
                                setPoolData({
                                    poolAddress: poolJson.poolAddress,
                                    totalUnits: totalUnits,
                                    totalMembers: poolJson.graphData.members.length.toString(),
                                    adjustmentFlowRate: "0",
                                    adjustmentFlowRateFormatted: "Synced from subgraph",
                                    tokenAddress: ""
                                })
                            } else if (poolJson.allocations && poolJson.allocations.items && poolJson.allocations.items.length > 0) {
                                // Use Supabase allocations as last resort
                                setPoolData({
                                    poolAddress: poolJson.poolAddress,
                                    totalUnits: poolJson.allocations.totalUnits || "0",
                                    totalMembers: poolJson.allocations.items.length.toString(),
                                    adjustmentFlowRate: "0",
                                    adjustmentFlowRateFormatted: "From database",
                                    tokenAddress: ""
                                })
                            } else {
                                // Only set error if we truly have no data
                                setPoolError('Pool data temporarily unavailable')
                            }
                            
                            // Always set allocations if available
                            if (poolJson.allocations) {
                                setPoolAllocations(poolJson.allocations)
                            }
                        } else {
                            setPoolError('Unable to connect to pool service')
                        }
                    } catch (poolErr) {
                        console.error('Failed to fetch pool data:', poolErr)
                        setPoolError('Pool service unavailable')
                    }
                }
            } catch (err) {
                console.error(err)
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-reach-blue"></div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-mono">{error || "Campaign not found"}</p>
                <Link href="/dashboard" className="px-4 py-2 bg-reach-blue text-white font-mono text-sm hover:opacity-90">
                    Return to Dashboard
                </Link>
            </div>
        )
    }

    const { campaign, participants } = data

    return (
        <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full p-4 md:p-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-reach-blue/60 hover:text-reach-blue mb-8 font-mono text-sm transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            <header className="mb-12 relative">
                <div className="absolute top-0 right-0 p-4 border border-dashed border-reach-blue/20 bg-reach-blue/5 rounded-lg space-y-3">
                    <div className="text-right">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-reach-blue/60 mb-1">Total Pool Allocation</p>
                        <p className="font-display text-2xl md:text-4xl text-reach-blue font-extrabold">{campaign.pool_total || "TBD"}</p>
                    </div>
                    {poolData && (
                        <div className="border-t border-reach-blue/10 pt-2 text-right">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-reach-blue/60 mb-1">Active Members</p>
                            <p className="font-mono text-lg text-reach-blue font-bold">{poolData.totalMembers}</p>
                        </div>
                    )}
                </div>

                <div className="max-w-2xl">
                    <div className="inline-block px-3 py-1 bg-reach-blue text-reach-paper font-mono text-xs font-bold uppercase mb-4 bg-crosshatch">
                        <span className="bg-reach-blue px-1 relative">Active Campaign</span>
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl text-reach-blue font-extrabold uppercase leading-none mb-4">{campaign.name}</h1>
                    <p className="font-mono text-reach-blue/80 max-w-xl leading-relaxed border-l-2 border-reach-blue/30 pl-4 italic">
                        {campaign.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                    {campaign.x_handle && (
                        <a
                            href={`https://x.com/${campaign.x_handle.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border-sketchy bg-white/50 hover:bg-white hover:border-reach-blue transition-colors flex items-center gap-2 font-mono text-sm group"
                        >
                            <span className="font-bold">X (Twitter)</span>
                            <span className="opacity-60 group-hover:opacity-100">{campaign.x_handle}</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" />
                        </a>
                    )}
                    {campaign.farcaster_handle && (
                        <a
                            href={`https://warpcast.com/${campaign.farcaster_handle.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border-sketchy bg-white/50 hover:bg-white hover:border-reach-blue transition-colors flex items-center gap-2 font-mono text-sm group"
                        >
                            <span className="font-bold">Farcaster</span>
                            <span className="opacity-60 group-hover:opacity-100">{campaign.farcaster_handle}</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" />
                        </a>
                    )}
                    {campaign.pool_address && (
                        <a
                            href={`https://sepolia.etherscan.io/address/${campaign.pool_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border-sketchy bg-white/50 hover:bg-white hover:border-reach-blue transition-colors flex items-center gap-2 font-mono text-sm group"
                        >
                            <Wallet className="w-4 h-4" />
                            <span className="font-bold">Pool</span>
                            <span className="opacity-60 group-hover:opacity-100">{campaign.pool_address.slice(0, 6)}...{campaign.pool_address.slice(-4)}</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" />
                        </a>
                    )}
                </div>
            </header>

            {/* Live stream visual (reuse dashboard stream UI) */}
            <section className="bg-reach-blue/5 p-4 md:p-6 mb-10 rounded-lg border-sketchy relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden="true">
                    <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dotted border-reach-blue/10 -ml-6"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-px border-l border-dotted border-reach-blue/10 -mr-6"></div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-reach-blue/70 mb-1">Live Campaign Stream</p>
                        <h3 className="font-display text-2xl text-reach-blue font-extrabold leading-tight">Current Flow</h3>
                        {poolData && (
                            <p className="font-mono text-xs text-reach-blue/70 mt-1">
                                Pool: {poolData.poolAddress?.slice(0, 6)}...{poolData.poolAddress?.slice(-4)} • Members: {poolData.totalMembers}
                            </p>
                        )}
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border-double-thick border-reach-blue px-6 py-4 guide-corners">
                        <div className="scale-110 origin-center">
                            <StreamCounter />
                        </div>
                        <p className="font-mono text-[10px] uppercase text-center text-reach-blue/60 mt-2">$LUNO stream</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Leaderboard */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-4 mb-6 relative">
                         <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                        <h2 className="font-display text-2xl text-reach-blue font-extrabold relative z-10 bg-reach-paper px-4 flex items-center gap-2">
                            <Trophy className="w-6 h-6" /> Leaderboard
                        </h2>
                        <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm border-sketchy p-1 guide-corners">
                        <div className="overflow-x-auto">
                            <table className="w-full font-mono text-sm">
                                <thead className="bg-reach-blue/5 border-b border-reach-blue/10">
                                    <tr>
                                        <th className="px-4 py-3 text-left opacity-60 font-normal w-16">Rank</th>
                                        <th className="px-4 py-3 text-left opacity-60 font-normal">User</th>
                                        <th className="px-4 py-3 text-right opacity-60 font-normal">Allocation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.length > 0 ? participants.map((participant, index) => {
                                        const totalScore = Number(participant.total_score || 0)
                                        // Prefer Supabase allocations (gda_units) when available
                                        const units = Number(
                                            (poolAllocations?.items || []).find((i) => i.fid === participant.fid)?.units ??
                                            participant.gda_units ??
                                            totalScore
                                        )

                                        // Allocation calculation:
                                        // 1) Prefer on-chain poolData totalUnits
                                        // 2) Fallback to Supabase allocations totalUnits
                                        // 3) Fallback to local sum of units in this leaderboard
                                        let sharePercent = "0"
                                        if (poolData && Number(poolData.totalUnits) > 0) {
                                            sharePercent = ((units / Number(poolData.totalUnits)) * 100).toFixed(2)
                                        } else if (poolAllocations?.totalUnits && Number(poolAllocations.totalUnits) > 0) {
                                            sharePercent = ((units / Number(poolAllocations.totalUnits)) * 100).toFixed(2)
                                        } else {
                                            const sumUnits = participants.reduce((acc, p) => {
                                                const u = Number(
                                                    (poolAllocations?.items || []).find((i) => i.fid === p.fid)?.units ??
                                                    p.gda_units ?? p.total_score ?? 0
                                                )
                                                return acc + u
                                            }, 0)
                                            if (sumUnits > 0) {
                                                sharePercent = ((units / sumUnits) * 100).toFixed(2)
                                            }
                                        }

                                        return (
                                            <tr key={participant.id} className="border-b border-reach-blue/5 hover:bg-white/60 transition-colors">
                                                <td className="px-4 py-3 font-bold text-reach-blue">#{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {participant.users?.pfp_url && (
                                                            <img src={participant.users.pfp_url} alt="" className="w-6 h-6 rounded-full border border-reach-blue/20" />
                                                        )}
                                                        <span className="font-bold">{participant.users?.display_name || participant.users?.username}</span>
                                                        <span className="opacity-40 text-xs">@{participant.users?.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-green-600">{sharePercent}%</span>
                                                        <span className="text-[10px] opacity-60">{units} units</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center opacity-60 italic">
                                                No participants yet. Be the first to join!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Info & FAQ */}
                <div className="space-y-8">
                    <div className="bg-reach-blue/5 p-6 border-sketchy relative">
                        <div className="absolute top-0 left-0 bg-reach-blue text-reach-paper px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                            Campaign Rules
                        </div>
                        <div className="mt-4 space-y-4 font-mono text-xs">
                            <div className="flex justify-between border-b border-reach-blue/10 pb-2">
                                <span className="opacity-60">Communication Quality</span>
                                <span className="font-bold">{Math.round(campaign.communication_quality_weight * 100)}%</span>
                            </div>
                            <div className="flex justify-between border-b border-reach-blue/10 pb-2">
                                <span className="opacity-60">Community Impact</span>
                                <span className="font-bold">{Math.round(campaign.community_impact_weight * 100)}%</span>
                            </div>
                            <div className="flex justify-between border-b border-reach-blue/10 pb-2">
                                <span className="opacity-60">Consistency</span>
                                <span className="font-bold">{Math.round(campaign.consistency_weight * 100)}%</span>
                            </div>
                             <div className="flex justify-between pt-2">
                                <span className="opacity-60">Reward Multiplier</span>
                                <span className="font-bold text-green-600">{campaign.reward_multiplier}x</span>
                            </div>
                        </div>
                    </div>

                    {campaign.faq && campaign.faq.length > 0 && (
                        <div>
                             <div className="flex items-center gap-2 mb-4 relative">
                                <h3 className="font-display text-xl text-reach-blue font-bold uppercase">FAQs</h3>
                                <div className="h-px bg-reach-blue flex-1 opacity-20"></div>
                            </div>
                            <div className="space-y-2">
                                {campaign.faq.map((item, index) => (
                                    <div key={index} className="border border-reach-blue/10 bg-white/40">
                                        <button 
                                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                            className="w-full text-left px-4 py-3 font-mono text-xs font-bold flex justify-between items-center hover:bg-reach-blue/5 transition-colors"
                                        >
                                            {item.question}
                                            {expandedFaq === index ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                        {expandedFaq === index && (
                                            <div className="px-4 py-3 pt-0 text-xs opacity-80 leading-relaxed border-t border-reach-blue/5 bg-white/20">
                                                {item.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
