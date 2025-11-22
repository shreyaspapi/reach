"use client"

import { useEffect, useState } from "react"

export function StreamCounter() {
    // Simulating a Superfluid stream
    const [balance, setBalance] = useState(1250.0)

    useEffect(() => {
        const interval = setInterval(() => {
            setBalance((prev) => prev + 0.000038) // Roughly 100/month streaming per second
        }, 100)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tighter tabular-nums relative inline-block px-2 overflow-visible">
            <span className="text-4xl md:text-6xl align-top mr-2 opacity-80 text-reach-blue inline-block">R</span>
            <span className="relative z-10 text-reach-blue inline-block">{balance.toFixed(6)}</span>
        </div>
    )
}
