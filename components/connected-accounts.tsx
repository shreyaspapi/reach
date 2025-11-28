"use client"

import { useProfile } from "@farcaster/auth-kit"
import { Wallet, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function ConnectedAccounts() {
    const { profile, isAuthenticated } = useProfile()
    const [copied, setCopied] = useState(false)

    // Use the first verified address or custody address
    const walletAddress = profile?.verifications?.[0] || profile?.custody

    const copyAddress = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (!isAuthenticated || !profile) return null

    return (
        <div className="grid gap-4">
            {/* Wallet Card - Spans Full Width */}
            <div className="bg-white/50 backdrop-blur-sm p-4 border-sketchy relative flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-reach-blue" />
                        <span className="font-mono font-bold uppercase text-sm">Connected Wallet</span>
                    </div>
                    <span className="text-xs font-mono bg-reach-blue text-white px-2 py-0.5 rounded-full">Active</span>
                </div>

                <div className="mt-2 flex items-center justify-between bg-reach-paper/50 p-2 border border-reach-blue/10 rounded">
                    <code className="font-mono text-[10px] md:text-xs truncate max-w-[200px] md:max-w-full text-reach-blue/80">
                        {walletAddress || "No verified address"}
                    </code>
                    {walletAddress && (
                        <button
                            onClick={copyAddress}
                            className="ml-2 p-1 hover:bg-reach-blue/10 rounded transition-colors text-reach-blue"
                            title="Copy Address"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Farcaster Card */}
                <div className="bg-white/50 backdrop-blur-sm p-4 border-sketchy relative flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="./farcaster.svg"
                                alt="Farcaster"
                                className="w-5 h-5 rounded-sm"
                            />
                            <span className="font-mono font-bold uppercase text-sm">Farcaster</span>
                        </div>
                        <span className="text-xs font-mono bg-reach-blue text-white px-2 py-0.5 rounded-full">Connected</span>
                    </div>

                    <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            {profile.pfpUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.pfpUrl} alt={profile.username || "User"} className="w-8 h-8 rounded-full border border-reach-blue/20" />
                            )}
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-mono text-xs font-bold truncate">{profile.displayName}</span>
                                <span className="font-mono text-xs text-reach-blue/80 truncate">@{profile.username}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
