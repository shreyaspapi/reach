"use client"

import Link from "next/link"
import { NeynarAuth } from "@/components/neynar-auth"

export default function LoginPage() {

  // Neynar handles authentication state internally
  // The NeynarAuth component will handle redirects after successful authentication

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Docs button - fixed position */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-reach-blue/30 bg-reach-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-reach-blue shadow-sm transition-all hover:border-reach-blue hover:bg-reach-blue/5 hover:shadow-md sm:px-4 sm:py-2"
        >
          📖 Docs
        </Link>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-md space-y-8 sm:space-y-10">
        {/* Logo with minimal frame */}
        <div className="relative mx-auto w-full max-w-sm">
          {/* Simple corner brackets */}
          <div className="absolute -left-3 -top-3 h-6 w-6 border-l-2 border-t-2 border-reach-blue" />
          <div className="absolute -right-3 -top-3 h-6 w-6 border-r-2 border-t-2 border-reach-blue" />
          <div className="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-reach-blue" />
          <div className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-reach-blue" />

          {/* Brand name */}
          <div className="py-10 text-center sm:py-12">
            <h1 className="font-display text-7xl font-extrabold tracking-tight text-reach-blue sm:text-8xl lg:text-9xl">
              Luno
            </h1>
            <p className="mt-3 font-mono text-sm uppercase tracking-[0.3em] text-reach-blue/70 sm:text-base lg:text-lg">
              The Social Economy
            </p>
          </div>
        </div>

        {/* Value proposition */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="inline-block -rotate-1 transform border-2 border-reach-blue/30 bg-reach-paper px-4 py-1.5 shadow-sm">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-reach-blue/70">Social Rewards</span>
            </div>
          </div>
          <p className="mx-auto max-w-sm font-mono text-sm leading-relaxed text-reach-blue/90">
            Your engagement has value.<br />
            Get paid for every meaningful interaction.
          </p>
          <div className="flex items-center justify-center gap-4 text-reach-blue/50">
            <span className="h-px w-8 bg-reach-blue/30"></span>
            <span className="font-mono text-[10px] uppercase tracking-widest">Real-time Streams</span>
            <span className="h-px w-8 bg-reach-blue/30"></span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-6">
          {/* Primary action - Farcaster Sign In */}
          <div className="w-full">
            <NeynarAuth />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 sm:bottom-6">
        <p className="text-center font-mono text-[10px] uppercase tracking-wider text-reach-blue/50">
          Superfluid × Farcaster × Base
        </p>
      </div>
    </main>
  )
}
