"use client"

import { LogOut, ChevronDown, Wallet, Globe } from "lucide-react"
import Link from "next/link"
import { StreamCounter } from "@/components/stream-counter"
import { PointsList } from "@/components/points-list"
import { CampaignCard } from "@/components/campaign-card"
import { ConnectedAccounts } from "@/components/connected-accounts"
import { EngagementHistory } from "@/components/engagement-history"
import { useNeynar } from "@/contexts/neynar-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Campaign } from "@/lib/supabase"
import { CAMPAIGNS } from "@/lib/campaigns"

export default function DashboardPage() {
    const { isAuthenticated, user, loading, isMiniApp, signOut } = useNeynar()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState < "overview" | "history" > ("overview")
    const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([])
    const [loadingCampaigns, setLoadingCampaigns] = useState(true)

    useEffect(() => {
        // Only redirect if NOT loading, NOT authenticated, AND NOT in Mini App
        if (!loading && !isAuthenticated && !isMiniApp) {
            router.push("/")
        }
    }, [isAuthenticated, loading, router, isMiniApp])

    useEffect(() => {
        async function fetchCampaigns() {
            try {
                const res = await fetch('/api/campaigns/active')
                if (res.ok) {
                    const data = await res.json()
                    if (data && data.length > 0) {
                        setActiveCampaigns(data)
                    } else {
                        // Fallback to mock campaigns if API returns empty (for dev/demo)
                         // Map mock campaigns to Campaign interface
                         const mockCampaigns = CAMPAIGNS.map(c => ({
                             id: c.id.toString(),
                             name: c.name,
                             description: c.description || "",
                             target_fid: 0,
                             target_username: c.handles?.farcaster || "",
                             is_active: true,
                             start_date: new Date().toISOString(),
                             communication_quality_weight: 0,
                             community_impact_weight: 0,
                             consistency_weight: 0,
                             active_campaign_weight: 0,
                             min_score_for_reward: 0,
                             reward_multiplier: 1,
                             created_at: new Date().toISOString(),
                             updated_at: new Date().toISOString(),
                             x_handle: c.handles?.x,
                             farcaster_handle: c.handles?.farcaster,
                             pool_total: "1M LUNO" // Default mock pool
                         }))
                         setActiveCampaigns(mockCampaigns as any)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch campaigns", error)
                 // Fallback to mock campaigns
                 const mockCampaigns = CAMPAIGNS.map(c => ({
                     id: c.id.toString(),
                     name: c.name,
                     description: c.description || "",
                     target_fid: 0,
                     target_username: c.handles?.farcaster || "",
                     is_active: true,
                     start_date: new Date().toISOString(),
                     communication_quality_weight: 0,
                     community_impact_weight: 0,
                     consistency_weight: 0,
                     active_campaign_weight: 0,
                     min_score_for_reward: 0,
                     reward_multiplier: 1,
                     created_at: new Date().toISOString(),
                     updated_at: new Date().toISOString(),
                     x_handle: c.handles?.x,
                     farcaster_handle: c.handles?.farcaster,
                     pool_total: "1M LUNO"
                 }))
                 setActiveCampaigns(mockCampaigns as any)
            } finally {
                setLoadingCampaigns(false)
            }
        }

        if (isAuthenticated || isMiniApp) {
            fetchCampaigns()
        }
    }, [isAuthenticated, isMiniApp])

    const handleLogout = async () => {
        signOut()
        router.push("/")
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-reach-blue/5">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-reach-blue"></div>
        </div>
    )

    if (!isAuthenticated && !isMiniApp) return null

    return (
        <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-8 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto bg-reach-paper/80 backdrop-blur-sm p-2 border-sketchy relative">
                    <h1 className="font-display text-2xl md:text-3xl text-reach-blue leading-none font-extrabold">Luno</h1>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest mt-1">
                        Personal Ledger • <span className="bg-reach-blue text-reach-paper px-1 bg-crosshatch relative"><span className="bg-reach-blue px-1 relative">Live</span></span>
                    </p>
                </div>

                <div className="flex items-start gap-4 pointer-events-auto">
                    <Link
                        href="/explore"
                        className="p-2 bg-reach-paper/80 backdrop-blur-sm hover:bg-reach-blue hover:text-reach-paper transition-colors border-sketchy cursor-pointer flex items-center gap-2"
                    >
                        <Globe className="w-5 h-5" />
                        <span className="font-mono text-xs font-bold hidden md:inline">Explore</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="p-2 bg-reach-paper/80 backdrop-blur-sm hover:bg-reach-blue hover:text-reach-paper transition-colors border-sketchy cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="sr-only">Sign out</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col">
                {/* Section 1: The Stream (Full Screen / Dominant) */}
                <section className="min-h-screen flex flex-col justify-center items-center p-4 md:p-8 relative">
                    <div className="w-full max-w-3xl relative">
                        {/* Vertical construction guide lines */}
                        <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dotted border-reach-blue/20 -ml-16"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-px border-l border-dotted border-reach-blue/20 -mr-16"></div>

                        <div className="border-double-thick border-reach-blue p-6 md:p-12 relative bg-white/40 backdrop-blur-sm guide-corners">
                            <div className="absolute top-0 left-0 bg-reach-blue text-reach-paper px-3 py-1 font-mono text-xs font-bold uppercase bg-crosshatch">
                                <span className="bg-reach-blue px-1 relative">Incoming Stream</span>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="font-mono text-sm tracking-widest mb-4 opacity-70">Current Flow Rate</p>
                                <div className="scale-125 origin-center py-8">
                                    <StreamCounter />
                                </div>
                                <p className="font-mono text-xs mt-4 opacity-60">$LUNO</p>
                            </div>

                            {/* Decorative corners */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-reach-blue"></div>
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-reach-blue"></div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="font-mono text-xs max-w-md mx-auto leading-relaxed opacity-80 italic">
                                "Your community is your currency. Every interaction flows value back to you."
                            </p>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <ChevronDown className="w-8 h-8 text-reach-blue opacity-50" />
                    </div>
                </section>

                {/* Section 2: Campaigns */}
                <section className="min-h-screen bg-reach-blue/5 p-4 md:p-8 pt-24 space-y-8">

                    {/* Tab Navigation */}
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="flex border-b border-reach-blue/20">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`px-6 py-3 font-mono text-sm tracking-widest border-b-2 transition-colors ${activeTab === "overview"
                                    ? "border-reach-blue text-reach-blue font-bold bg-reach-blue/5"
                                    : "border-transparent text-reach-blue/50 hover:text-reach-blue/80"
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`px-6 py-3 font-mono uppercase text-sm tracking-widest border-b-2 transition-colors ${activeTab === "history"
                                    ? "border-reach-blue text-reach-blue font-bold bg-reach-blue/5"
                                    : "border-transparent text-reach-blue/50 hover:text-reach-blue/80"
                                    }`}
                            >
                                Engagement History
                            </button>
                        </div>
                    </div>

                    {activeTab === "overview" ? (
                        <>
                            {/* Connected Identities */}
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center gap-4 mb-8 relative">
                                    {/* Extended construction guide line */}
                                    <div className="absolute left-0 right-0 h-px border-t border-dashed border-reach-blue/25 -mx-12"></div>
                                    <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                                    <h2 className="font-display text-3xl text-reach-blue font-extrabold relative z-10 bg-reach-paper px-4">Identity</h2>
                                    <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                                </div>
                                <ConnectedAccounts />
                            </div>

                            {/* Campaigns */}
                            <div className="max-w-4xl mx-auto pb-24 mt-16">
                                <div className="flex items-center gap-4 mb-8 relative">
                                    {/* Extended construction guide line */}
                                    <div className="absolute left-0 right-0 h-px border-t border-dashed border-reach-blue/25 -mx-12"></div>
                                    <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                                    <h2 className="font-display text-3xl text-reach-blue font-extrabold relative z-10 bg-reach-paper px-4">Active Campaigns</h2>
                                    <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {loadingCampaigns ? (
                                        <div className="text-center font-mono opacity-60">Loading campaigns...</div>
                                    ) : activeCampaigns.map((campaign) => (
                                        <CampaignCard
                                            key={campaign.id}
                                            id={campaign.id}
                                            title={campaign.name}
                                            creator={campaign.x_handle?.replace("@", "") || campaign.name}
                                            xHandle={campaign.x_handle || "@unknown"}
                                            farcasterHandle={campaign.farcaster_handle || campaign.target_username || "@unknown"}
                                            description={campaign.description || "No description provided."}
                                            reward={`Users earn tokens based on engagement in pool ${campaign.pool_total || "TBD"}`}
                                            status={campaign.is_active ? "Active" : "Inactive"}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Contract Info Footer */}
                            <div className="max-w-4xl mx-auto mb-12 pt-8 border-t border-dashed border-reach-blue/20 opacity-60 hover:opacity-100 transition-opacity">
                                <div className="flex flex-col md:flex-row justify-between gap-4 font-mono text-[10px] uppercase">
                                    <div className="space-y-2">
                                        <p className="font-bold">Deployed Contracts (Sepolia)</p>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex gap-2">
                                                <span>LUNO Supertoken:</span>
                                                <a href="https://sepolia.etherscan.io/address/0xe58c945fbb1f2c5e7398f1a4b9538f52778b31a7" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-reach-blue decoration-wavy">
                                                    0xE58C...31a7
                                                </a>
                                            </div>
                                            <div className="flex gap-2">
                                                <span>Pool Contract:</span>
                                                <a href="https://sepolia.etherscan.io/address/0x2cc199976B4ACBe4211E943c1E7F070d76570D4e" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-reach-blue decoration-wavy">
                                                    0x2cc1...D4e
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p>System Status: <span className="text-green-600 font-bold">OPERATIONAL</span></p>
                                        <p>Network: Sepolia Testnet</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="max-w-4xl mx-auto pb-24">
                            <EngagementHistory />
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
