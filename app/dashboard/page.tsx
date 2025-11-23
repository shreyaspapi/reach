"use client"

import { LogOut, ChevronDown, Wallet, Globe } from "lucide-react"
import Link from "next/link"
import { StreamCounter } from "@/components/stream-counter"
import { PointsList } from "@/components/points-list"
import { CampaignCard } from "@/components/campaign-card"
import { ConnectedAccounts } from "@/components/connected-accounts"
import { EngagementHistory } from "@/components/engagement-history"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
    const { logout, authenticated, ready } = usePrivy()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<"overview" | "history">("overview")

    useEffect(() => {
        if (ready && !authenticated) {
            router.push("/")
        }
    }, [ready, authenticated, router])

    const handleLogout = async () => {
        await logout()
        router.push("/")
    }

    if (!ready || !authenticated) return null

    return (
        <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-8 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto bg-reach-paper/80 backdrop-blur-sm p-2 border-sketchy relative">
                    <h1 className="font-display text-2xl md:text-3xl text-reach-blue uppercase leading-none font-extrabold">Reach</h1>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest mt-1">
                        Personal Ledger • <span className="bg-reach-blue text-reach-paper px-1 bg-crosshatch relative"><span className="bg-reach-blue px-1 relative">LIVE</span></span>
                    </p>
                </div>

                <div className="flex items-start gap-4 pointer-events-auto">
                    <Link 
                        href="/explore"
                        className="p-2 bg-reach-paper/80 backdrop-blur-sm hover:bg-reach-blue hover:text-reach-paper transition-colors border-sketchy cursor-pointer flex items-center gap-2"
                    >
                        <Globe className="w-5 h-5" />
                        <span className="font-mono text-xs font-bold uppercase hidden md:inline">Explore</span>
                    </Link>

                    <Link 
                        href="/tradbtc"
                        className="p-2 bg-reach-paper/80 backdrop-blur-sm hover:bg-reach-blue hover:text-reach-paper transition-colors border-sketchy cursor-pointer flex items-center gap-2"
                    >
                        <Wallet className="w-5 h-5" />
                        <span className="font-mono text-xs font-bold uppercase hidden md:inline">TradBTC</span>
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
                                <p className="font-mono text-sm uppercase tracking-widest mb-4 opacity-70">Current Flow Rate</p>
                                <div className="scale-125 origin-center py-8">
                                    <StreamCounter />
                                </div>
                                <p className="font-mono text-xs mt-4 opacity-60">$REACH</p>
                            </div>

                            {/* Decorative corners */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-reach-blue"></div>
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-reach-blue"></div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="font-mono text-xs max-w-md mx-auto leading-relaxed opacity-80 italic">
                                "Compound interest is the eighth wonder of the world. He who understands it, earns it."
                            </p>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <ChevronDown className="w-8 h-8 text-reach-blue opacity-50" />
                    </div>
                </section>

                {/* Section 2: Allocations & Campaigns */}
                <section className="min-h-screen bg-reach-blue/5 p-4 md:p-8 pt-24 space-y-8">
                    
                    {/* Tab Navigation */}
                    <div className="max-w-4xl mx-auto mb-8">
                         <div className="flex border-b border-reach-blue/20">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`px-6 py-3 font-mono uppercase text-sm tracking-widest border-b-2 transition-colors ${
                                    activeTab === "overview" 
                                        ? "border-reach-blue text-reach-blue font-bold bg-reach-blue/5" 
                                        : "border-transparent text-reach-blue/50 hover:text-reach-blue/80"
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`px-6 py-3 font-mono uppercase text-sm tracking-widest border-b-2 transition-colors ${
                                    activeTab === "history" 
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
                                    <h2 className="font-display text-3xl uppercase text-reach-blue font-extrabold relative z-10 bg-reach-paper px-4">Identity</h2>
                                    <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                                </div>
                                <ConnectedAccounts />
                            </div>
        
                            {/* Allocations */}
                            <div className="max-w-4xl mx-auto mt-16">
                                <div className="flex items-center gap-4 mb-8 relative">
                                    {/* Extended construction guide line */}
                                    <div className="absolute left-0 right-0 h-px border-t border-dashed border-reach-blue/25 -mx-12"></div>
                                    <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                                    <h2 className="font-display text-3xl uppercase text-reach-blue font-extrabold relative z-10 bg-reach-paper px-4">Allocations</h2>
                                    <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                                </div>
                                <div className="bg-white/50 backdrop-blur-sm p-6 border-sketchy relative guide-corners">
                                    <PointsList />
                                    <div className="mt-4 pt-4 border-t border-reach-blue/10 text-right">
                                        <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">Last Sync: Block 1829304</p>
                                    </div>
                                </div>
                            </div>
        
                            {/* Campaigns */}
                            <div className="max-w-4xl mx-auto pb-24 mt-16">
                                <div className="flex items-center gap-4 mb-8 relative">
                                    {/* Extended construction guide line */}
                                    <div className="absolute left-0 right-0 h-px border-t border-dashed border-reach-blue/25 -mx-12"></div>
                                    <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                                    <h2 className="font-display text-3xl uppercase text-reach-blue font-extrabold relative z-10 bg-reach-paper px-4">Active Campaigns</h2>
                                    <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                                </div>
        
                                <div className="grid grid-cols-1 gap-6">
                                    <CampaignCard
                                        title="Talk to Shreyas"
                                        creator="Shreyas Papinwar"
                                        xHandle="@spapinwar"
                                        farcasterHandle="@shreyaspapi"
                                        description="Shreyas LOVES attention. Seriously. Tweet at him, cast at him, meme him, roast him—anything you do to @spapinwar on X or @shreyaspapi on Farcaster earns you $REACH, streamed directly into your wallet via Superfluid. The more chaotic (yet relevant), the higher your score. Help Shreyas achieve his final form: a man drowning in notifications."
                                        reward="Users earn $REACH tokens in real‑time streams based on their AI‑evaluated engagement."
                                        status="Active"
                                    />
                                </div>
                            </div>

                            {/* Contract Info Footer */}
                            <div className="max-w-4xl mx-auto mb-12 pt-8 border-t border-dashed border-reach-blue/20 opacity-60 hover:opacity-100 transition-opacity">
                                <div className="flex flex-col md:flex-row justify-between gap-4 font-mono text-[10px] uppercase">
                                    <div className="space-y-2">
                                        <p className="font-bold">Deployed Contracts (Sepolia)</p>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex gap-2">
                                                <span>REACH Supertoken:</span>
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
