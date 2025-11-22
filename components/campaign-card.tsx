import { ExternalLink } from "lucide-react"

interface CampaignCardProps {
    title: string
    creator: string
    xHandle: string
    farcasterHandle: string
    description: string
    reward: string
    status: "Active" | "Inactive" | "Completed"
}

export function CampaignCard({
    title,
    creator,
    xHandle,
    farcasterHandle,
    description,
    reward,
    status,
}: CampaignCardProps) {
    return (
        <div className="border-sketchy p-6 bg-reach-paper/80 backdrop-blur-sm relative group hover:bg-white/40 transition-colors guide-corners">
            {/* Status Badge with cross-hatch fill */}
            <div className="absolute -top-3 -right-3 bg-reach-blue text-reach-paper px-3 py-1 font-mono text-xs font-bold uppercase border-2 border-reach-paper shadow-sm bg-crosshatch relative">
                <span className="bg-reach-blue px-2 relative">{status}</span>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    {/* Title with subtle outlined effect */}
                    <h3 className="font-display text-3xl text-reach-blue uppercase tracking-tight font-extrabold">{title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono mt-1 opacity-80">
                        <span className="font-bold">BY {creator.toUpperCase()}</span>
                        <span className="hidden sm:inline text-reach-blue/40">////////////////</span>
                        <div className="flex gap-4">
                            <a
                                href={`https://x.com/${xHandle.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-reach-blue hover:underline decoration-wavy transition-all flex items-center gap-1"
                            >
                                {xHandle} <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                                href={`https://warpcast.com/${farcasterHandle.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-reach-blue hover:underline decoration-wavy transition-all flex items-center gap-1"
                            >
                                {farcasterHandle} <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                <p className="font-mono text-sm leading-relaxed text-reach-blue/90 border-l-2 border-reach-blue/30 pl-4 italic">
                    {description}
                </p>

                <div className="pt-4 border-t-2 border-dashed border-reach-blue/30 relative">
                    {/* Construction line extension - blueprint style */}
                    <div className="absolute top-0 -left-10 -right-10 h-px border-t border-dotted border-reach-blue/20 pointer-events-none"></div>

                    {/* Technical annotation style label */}
                    <p className="font-mono text-xs font-bold uppercase tracking-widest mb-1 text-reach-blue bg-crosshatch-light inline-block px-2 border border-reach-blue/20 text-annotation">Reward Mechanism</p>
                    <p className="font-mono text-sm">{reward}</p>
                </div>
            </div>
        </div>
    )
}
