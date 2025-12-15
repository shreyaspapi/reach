"use client"

import Link from "next/link"
import { NeynarAuth } from "@/components/neynar-auth"

export default function LoginPage() {

  // Neynar handles authentication state internally
  // The NeynarAuth component will handle redirects after successful authentication

  return (
    <main className="flex flex-col items-center justify-between min-h-screen px-6 py-8 safe-area-inset">
      {/* Top section with badge and docs link */}
      <div className="relative w-full flex items-center justify-center pt-4 px-4">
        <div className="absolute right-4 top-4">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full border border-reach-blue/30 bg-reach-paper/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-reach-blue/80 shadow-sm backdrop-blur hover:border-reach-blue hover:text-reach-blue"
          >
            Docs
          </Link>
        </div>
      </div>
      {/* Center section with logo and branding */}
      <div className="flex flex-1 flex-col items-center justify-center w-full max-w-sm mx-auto gap-12">
        {/* Logo with minimal frame */}
        <div className="relative w-full max-w-xs">
          {/* Simple corner brackets */}
          <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-reach-blue" />
          <div className="absolute -top-3 -right-3 w-6 h-6 border-r-2 border-t-2 border-reach-blue" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-l-2 border-b-2 border-reach-blue" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-reach-blue" />

          {/* Brand name */}
          <div className="text-center py-12">
            <h1 className="font-display text-8xl md:text-9xl text-reach-blue font-extrabold tracking-tight">
              Luno
            </h1>
            <p className="font-mono text-base md:text-lg text-reach-blue/70 mt-3 tracking-[0.3em] uppercase">
              The Social Economy
            </p>
          </div>
        </div>

        {/* Value proposition */}
        <div className="text-center space-y-4 max-w-xs">
          <div className="flex justify-center">
            <div className="inline-block border-2 border-reach-blue px-4 py-1.5 bg-reach-blue text-reach-paper transform -rotate-1">
              <span className="font-mono text-xs font-bold tracking-widest uppercase">Social Rewards</span>
            </div>
          </div>
          <p className="font-mono text-sm text-reach-blue/90 leading-relaxed">
            Your engagement has value.<br />
            Get paid for every meaningful interaction.
          </p>
          <div className="flex items-center justify-center gap-4 text-reach-blue/50">
            <span className="w-8 h-px bg-reach-blue/30"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest">Real-time Streams</span>
            <span className="w-8 h-px bg-reach-blue/30"></span>
          </div>
        </div>

        {/* Sign in button */}
        <div className="flex flex-col items-center gap-6">
          <NeynarAuth />

          <Link
            href="/explore"
            className="font-mono text-xs text-reach-blue/70 hover:text-reach-blue hover:underline decoration-wavy underline-offset-4 uppercase tracking-widest transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-xs pb-4">
        <p className="font-mono text-[10px] text-center text-reach-blue/50 tracking-wider uppercase">
          Powered by Superfluid × Farcaster
        </p>
      </div>
    </main>
  )
}
