"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Wallet, Copy, Check } from "lucide-react" 
import { cn } from "@/lib/utils"
import { useState } from "react"

const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <g>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
    </svg>
)

export function ConnectedAccounts() {
    const { user, linkTwitter, linkFarcaster, unlinkTwitter, unlinkFarcaster } = usePrivy()
    const [copied, setCopied] = useState(false)

    const twitterAccount = user?.linkedAccounts?.find((account) => account.type === 'twitter_oauth') as any
    const farcasterAccount = user?.linkedAccounts?.find((account) => account.type === 'farcaster') as any
    const wallet = user?.wallet

    const copyAddress = () => {
        if (wallet?.address) {
            navigator.clipboard.writeText(wallet.address)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="grid gap-4">
            {/* Wallet Card - Spans Full Width */}
            <div className="bg-white/50 backdrop-blur-sm p-4 border-sketchy relative flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-reach-blue" />
                        <span className="font-mono font-bold uppercase text-sm">Embedded Wallet</span>
                    </div>
                    <span className="text-xs font-mono bg-reach-blue text-white px-2 py-0.5 rounded-full">Active</span>
                </div>
                
                <div className="mt-2 flex items-center justify-between bg-reach-paper/50 p-2 border border-reach-blue/10 rounded">
                     <code className="font-mono text-[10px] md:text-xs truncate max-w-[200px] md:max-w-full text-reach-blue/80">
                        {wallet?.address || "Creating wallet..."}
                     </code>
                     <button 
                        onClick={copyAddress}
                        className="ml-2 p-1 hover:bg-reach-blue/10 rounded transition-colors text-reach-blue"
                        title="Copy Address"
                     >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                     </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Twitter/X Card */}
                <div className="bg-white/50 backdrop-blur-sm p-4 border-sketchy relative flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <XIcon className="w-5 h-5 text-reach-blue" />
                            <span className="font-mono font-bold uppercase text-sm">X (Twitter)</span>
                        </div>
                        {twitterAccount ? (
                            <span className="text-xs font-mono bg-reach-blue text-white px-2 py-0.5 rounded-full">Connected</span>
                        ) : (
                            <span className="text-xs font-mono opacity-50">Not Connected</span>
                        )}
                     </div>
                     
                        {twitterAccount ? (
                            <div className="mt-2 flex flex-col gap-2">
                               <div className="flex items-center gap-2">
                                   {twitterAccount.profilePictureUrl && (
                                       // eslint-disable-next-line @next/next/no-img-element
                                       <img src={twitterAccount.profilePictureUrl} alt={twitterAccount.username} className="w-8 h-8 rounded-full border border-reach-blue/20" />
                                   )}
                                   <div className="flex flex-col overflow-hidden">
                                       <span className="font-mono text-xs font-bold truncate">{twitterAccount.name}</span>
                                       <span className="font-mono text-xs text-reach-blue/80 truncate">@{twitterAccount.username}</span>
                                   </div>
                               </div>
                               <button onClick={() => unlinkTwitter(twitterAccount.subject)} className="text-[10px] text-red-500 hover:underline text-left font-mono uppercase self-start">Disconnect</button>
                            </div>
                        ) : (
                         <button 
                            onClick={linkTwitter}
                            className="mt-2 text-xs bg-reach-blue text-white px-3 py-2 font-mono uppercase hover:bg-reach-blue/90 transition-colors border border-transparent hover:border-reach-blue shadow-sm"
                        >
                            Connect X
                        </button>
                     )}
                </div>
    
                {/* Farcaster Card */}
                <div className="bg-white/50 backdrop-blur-sm p-4 border-sketchy relative flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src="https://raw.githubusercontent.com/vrypan/farcaster-brand/refs/heads/main/icons/icon-rounded/purple-white.png" 
                                alt="Farcaster" 
                                className="w-5 h-5 rounded-sm" 
                            />
                            <span className="font-mono font-bold uppercase text-sm">Farcaster</span>
                        </div>
                        {farcasterAccount ? (
                            <span className="text-xs font-mono bg-reach-blue text-white px-2 py-0.5 rounded-full">Connected</span>
                        ) : (
                             <span className="text-xs font-mono opacity-50">Not Connected</span>
                        )}
                    </div>
    
                    {farcasterAccount ? (
                        <div className="mt-2 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                {farcasterAccount.pfp && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={farcasterAccount.pfp} alt={farcasterAccount.username} className="w-8 h-8 rounded-full border border-reach-blue/20" />
                                )}
                                 <div className="flex flex-col overflow-hidden">
                                    <span className="font-mono text-xs font-bold truncate">{farcasterAccount.displayName}</span>
                                    <span className="font-mono text-xs text-reach-blue/80 truncate">@{farcasterAccount.username}</span>
                                </div>
                            </div>
                            <button onClick={() => unlinkFarcaster(farcasterAccount.fid)} className="text-[10px] text-red-500 hover:underline text-left font-mono uppercase self-start">Disconnect</button>
                        </div>
                    ) : (
                        <button 
                            onClick={linkFarcaster}
                            className="mt-2 text-xs bg-[#855DCD] text-white px-3 py-2 font-mono uppercase hover:bg-[#855DCD]/90 transition-colors border border-transparent shadow-sm"
                        >
                            Connect Farcaster
                        </button>
                     )}
                </div>
            </div>
        </div>
    )
}
