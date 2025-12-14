"use client"

import { useLunoStream } from "@/hooks/use-reach-stream"
import { Loader2 } from "lucide-react"

export function StreamCounter() {
    const { balance, hasStream } = useLunoStream()

    // Fallback to 0 if no stream found yet (or loading)
    // Convert to whole number without decimals
    const numericBalance = hasStream ? parseFloat(balance) : 0
    const displayBalance = Math.floor(numericBalance).toString()

    return (
        <div className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tighter tabular-nums relative inline-block px-2 overflow-visible">
            <span className="text-4xl md:text-6xl align-top mr-2 opacity-80 text-reach-blue inline-block">L</span>
            <span className="relative z-10 text-reach-blue inline-block">{displayBalance}</span>
        </div>
    )
}
