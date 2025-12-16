import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface CampaignCardProps {
    id: string | number
    title: string
    creator: string
    xHandle: string
    farcasterHandle: string
    description: string
    reward: string
    status: "Active" | "Inactive" | "Completed"
}

export function CampaignCard({
    id,
    title,
    creator,
    xHandle,
    farcasterHandle,
    description,
    reward,
    status,
}: CampaignCardProps) {
    return (
        <Link href={`/campaigns/${id}`} className="block">
            <div className="border-sketchy p-4 sm:p-6 bg-reach-paper/80 backdrop-blur-sm relative group hover:bg-white/40 transition-all duration-300 guide-corners cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]">
                {/* Mobile CTA indicator */}
                <div className="absolute -top-2 -right-2 bg-reach-blue text-reach-paper rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg border-2 border-reach-paper group-hover:bg-reach-blue/90 transition-colors">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>

                {/* Status Badge with cross-hatch fill */}
                <div className="absolute -top-2 -left-2 bg-reach-blue text-reach-paper px-2 sm:px-3 py-0.5 sm:py-1 font-mono text-[10px] sm:text-xs font-bold uppercase border-2 border-reach-paper shadow-sm bg-crosshatch relative">
                    <span className="bg-reach-blue px-1 sm:px-2 relative">{status}</span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    <div className="relative">
                        {/* Title with subtle outlined effect */}
                        <h3 className="font-display text-2xl sm:text-3xl text-reach-blue uppercase tracking-tight font-extrabold leading-tight group-hover:underline decoration-wavy underline-offset-4">
                            {title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-mono mt-1 opacity-70">
                            <span className="font-bold text-reach-blue/80">BY {creator.toUpperCase()}</span>
                            <span className="hidden sm:inline text-reach-blue/40">////////////////</span>
                            <div className="flex gap-2 sm:gap-4">
                                <span className="flex items-center gap-1">
                                    {xHandle}
                                </span>
                                <span className="flex items-center gap-1">
                                    {farcasterHandle}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="font-mono text-xs sm:text-sm leading-relaxed text-reach-blue/90 border-l-2 border-reach-blue/30 pl-3 sm:pl-4 italic line-clamp-2-custom">
                        {description}
                    </p>

                    <div className="pt-3 sm:pt-4 border-t-2 border-dashed border-reach-blue/30 relative">
                        {/* Construction line extension - blueprint style */}
                        <div className="absolute top-0 -left-8 -right-8 h-px border-t border-dotted border-reach-blue/20 pointer-events-none"></div>

                        {/* Technical annotation style label */}
                        <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 text-reach-blue bg-crosshatch-light inline-block px-1.5 sm:px-2 border border-reach-blue/20 text-annotation">
                            Reward Mechanism
                        </p>
                        <p className="font-mono text-xs sm:text-sm leading-tight">{reward}</p>
                    </div>
                </div>

                {/* Mobile touch feedback overlay */}
                <div className="absolute inset-0 bg-reach-blue/0 group-active:bg-reach-blue/10 transition-colors rounded-lg pointer-events-none" />
            </div>
        </Link>
    )
}
