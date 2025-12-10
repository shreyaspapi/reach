"use client"

import { Twitter as TwitterIcon, Star, MessageSquare, Heart, Repeat, ExternalLink, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProfile } from "@farcaster/auth-kit"
import { useEffect, useState } from "react"

const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
)

const FarcasterIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M4.5 4.5H19.5C20.8807 4.5 22 5.61929 22 7V17C22 18.3807 20.8807 19.5 19.5 19.5H4.5C3.11929 19.5 2 18.3807 2 17V7C2 5.61929 3.11929 4.5 4.5 4.5Z" />
        <path d="M16.5 9H14.5V13H16.5V9Z" fill="white" />
        <path d="M9.5 9H7.5V13H9.5V9Z" fill="white" />
        <path d="M7.5 15H16.5V17H7.5V15Z" fill="white" />
    </svg>
)

// Type definitions
export interface Interaction {
    id: string
    platform: "twitter" | "farcaster"
    content: string
    timestamp: string
    score: number
    type: "reply" | "mention" | "quote" | "cast"
    url: string
    engagement?: {
        likes: number
        replies: number
        reposts: number
    }
    scoreBreakdown?: {
        communicationQuality: number
        communityImpact: number
        consistency: number
        activeCampaign: number
    }
}

export function EngagementHistory() {
    const { profile } = useProfile()
    const [interactions, setInteractions] = useState < Interaction[] > ([])
    const [userStats, setUserStats] = useState < any > (null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState < string | null > (null)

    const userFid = profile?.fid

    useEffect(() => {
        async function fetchData() {
            if (!userFid) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)

                // Fetch both casts and user stats
                const [castsResponse, statsResponse] = await Promise.all([
                    fetch(`/api/dashboard/casts?fid=${userFid}&limit=50`),
                    fetch(`/api/dashboard/user/${userFid}`)
                ])

                if (!castsResponse.ok) {
                    throw new Error('Failed to fetch casts')
                }

                const castsData = await castsResponse.json()

                // Transform database casts to Interaction format
                const transformedCasts: Interaction[] = castsData.casts.map((cast: any) => ({
                    id: cast.id,
                    platform: "farcaster" as const,
                    content: cast.text,
                    timestamp: cast.timestamp,
                    score: Math.round(cast.total_score),
                    type: cast.parent_hash ? "reply" as const : "cast" as const,
                    url: `https://warpcast.com/~/conversations/${cast.cast_hash}`,
                    engagement: {
                        likes: cast.likes_count || 0,
                        replies: cast.replies_count || 0,
                        reposts: cast.recasts_count || 0
                    },
                    scoreBreakdown: {
                        communicationQuality: cast.communication_quality_score,
                        communityImpact: cast.community_impact_score,
                        consistency: cast.consistency_score,
                        activeCampaign: cast.active_campaign_score
                    }
                }))

                setInteractions(transformedCasts)

                // Set user stats if available
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json()
                    setUserStats(statsData.stats)
                }

                setError(null)
            } catch (err) {
                console.error('Error fetching data:', err)
                setError('Failed to load engagement history')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [userFid])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8 relative">
                {/* Extended construction guide line */}
                <div className="absolute left-0 right-0 h-px border-t border-dashed border-reach-blue/25 -mx-12"></div>
                <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                <h2 className="font-display text-3xl uppercase text-reach-blue font-extrabold relative z-10 bg-reach-paper px-4">Engagement Log</h2>
                <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-reach-blue animate-spin mb-4" />
                    <p className="font-mono text-sm uppercase tracking-widest opacity-60">
                        Loading your engagement history...
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border-2 border-red-200 p-4 text-center">
                    <p className="font-mono text-sm text-red-600">{error}</p>
                </div>
            )}

            {!loading && !error && interactions.length === 0 && (
                <div className="bg-white/50 backdrop-blur-sm p-12 border-sketchy text-center">
                    <p className="font-mono text-sm uppercase tracking-widest opacity-60 mb-2">
                        No engagement history yet
                    </p>
                    <p className="font-mono text-xs opacity-40">
                        Start engaging with @shreyaspapi to see your casts here!
                    </p>
                </div>
            )}

            {/* User Stats Summary */}
            {!loading && !error && userStats && interactions.length > 0 && (
                <div className="bg-white/50 backdrop-blur-sm p-6 border-sketchy relative mb-6">
                    <div className="absolute top-0 left-0 bg-reach-blue text-reach-paper px-3 py-1 font-mono text-xs font-bold uppercase bg-crosshatch">
                        <span className="bg-reach-blue px-1 relative">Your Stats</span>
                    </div>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="font-display text-3xl text-reach-blue font-bold">
                                {userStats.total_casts || 0}
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mt-1">
                                Total Casts
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-display text-3xl text-reach-blue font-bold">
                                {userStats.average_score ? userStats.average_score.toFixed(1) : '0.0'}
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mt-1">
                                Avg Score
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-display text-3xl text-reach-blue font-bold">
                                {userStats.highest_score ? userStats.highest_score.toFixed(0) : '0'}
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mt-1">
                                Best Score
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-display text-3xl text-reach-blue font-bold">
                                {userStats.total_score ? Math.round(userStats.total_score) : '0'}
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mt-1">
                                Total Points
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && interactions.length > 0 && (
                <div className="grid gap-4">
                    {interactions.map((interaction) => (
                        <div
                            key={interaction.id}
                            className="bg-white/50 backdrop-blur-sm p-4 border-sketchy relative group hover:bg-white/80 transition-all"
                        >
                            <div className="flex justify-between items-start gap-4">
                                {/* Icon & Platform */}
                                <div className="shrink-0">
                                    <div className={cn(
                                        "w-8 h-8 flex items-center justify-center border-2 rounded-md",
                                        interaction.platform === "twitter"
                                            ? "bg-black text-white border-black"
                                            : "bg-[#855DCD] text-white border-[#855DCD]"
                                    )}>
                                        {interaction.platform === "twitter" ? (
                                            <XIcon className="w-4 h-4" />
                                        ) : (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src="/farcaster.svg"
                                                alt="Farcaster"
                                                className="w-full h-full rounded-sm"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                                            {new Date(interaction.timestamp).toLocaleDateString()} • {interaction.type}
                                        </span>
                                        <a
                                            href={interaction.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="w-3 h-3 text-reach-blue" />
                                        </a>
                                    </div>
                                    <p className="font-mono text-sm text-reach-blue/90 leading-relaxed">
                                        {interaction.content}
                                    </p>

                                    {/* Engagement Stats - Farcaster Only */}
                                    {interaction.engagement && interaction.platform === "farcaster" && (
                                        <div className="flex gap-4 mt-3 text-xs font-mono opacity-50">
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-3 h-3" /> {interaction.engagement.likes}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" /> {interaction.engagement.replies}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Repeat className="w-3 h-3" /> {interaction.engagement.reposts}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Score */}
                                <div className="shrink-0 text-right">
                                    <div className="flex items-center gap-1 justify-end text-reach-blue font-bold font-display text-xl">
                                        +{interaction.score}
                                        <Star className="w-4 h-4 fill-reach-blue" />
                                    </div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest opacity-60">Points</div>
                                </div>
                            </div>

                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-reach-blue/20"></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-reach-blue/20"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Footer */}
            {!loading && !error && interactions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-reach-blue/10 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">
                        Showing {interactions.length} engagement{interactions.length !== 1 ? 's' : ''} •
                        Total Score: {interactions.reduce((sum, i) => sum + i.score, 0)} points
                    </p>
                </div>
            )}
        </div>
    )
}
