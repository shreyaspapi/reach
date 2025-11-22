import { Twitter as TwitterIcon, Star, MessageSquare, Heart, Repeat, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

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
        <path d="M16.5 9H14.5V13H16.5V9Z" fill="white"/>
        <path d="M9.5 9H7.5V13H9.5V9Z" fill="white"/>
        <path d="M7.5 15H16.5V17H7.5V15Z" fill="white"/>
    </svg>
)

// Mock data type definition
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
}

// Mock data
const MOCK_INTERACTIONS: Interaction[] = [
    {
        id: "1",
        platform: "twitter",
        content: "@spapinwar this is actually insane, the blueprint design is clean 🏗️",
        timestamp: "2025-03-10T14:22:00Z",
        score: 150,
        type: "mention",
        url: "https://twitter.com/user/status/1",
        engagement: { likes: 12, replies: 2, reposts: 1 }
    },
    {
        id: "2",
        platform: "farcaster",
        content: "Just checked out what @shreyaspapi is building. The attention economy is about to change forever.",
        timestamp: "2025-03-09T09:15:00Z",
        score: 300,
        type: "cast",
        url: "https://warpcast.com/user/0x123",
        engagement: { likes: 45, replies: 8, reposts: 12 }
    },
    {
        id: "3",
        platform: "twitter",
        content: "Replying to @spapinwar: scale of 1-10 how much coffee did this take?",
        timestamp: "2025-03-08T18:45:00Z",
        score: 50,
        type: "reply",
        url: "https://twitter.com/user/status/2",
        engagement: { likes: 3, replies: 1, reposts: 0 }
    },
    {
        id: "4",
        platform: "farcaster",
        content: "Frame support when? @shreyaspapi",
        timestamp: "2025-03-11T11:30:00Z",
        score: 75,
        type: "mention",
        url: "https://warpcast.com/user/0x456",
        engagement: { likes: 5, replies: 0, reposts: 0 }
    }
]

export function EngagementHistory() {
    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4 mb-8 relative">
                {/* Extended construction guide line */}
                <div className="absolute left-0 right-0 h-px border-t border-dashed border-reach-blue/25 -mx-12"></div>
                <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
                <h2 className="font-display text-3xl uppercase text-reach-blue font-extrabold relative z-10 bg-reach-paper px-4">Engagement Log</h2>
                <div className="h-px bg-reach-blue flex-1 opacity-30 relative z-10"></div>
            </div>

            <div className="grid gap-4">
                {MOCK_INTERACTIONS.map((interaction) => (
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
                                            src="https://raw.githubusercontent.com/vrypan/farcaster-brand/refs/heads/main/icons/icon-rounded/purple-white.png" 
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

             {/* Empty State / Loading visual */}
             <div className="mt-4 pt-4 border-t border-reach-blue/10 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-50 animate-pulse">
                    Scanning network for new signals...
                </p>
            </div>
        </div>
    )
}
