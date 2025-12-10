"use client"

import { SignInButton, useProfile } from "@farcaster/auth-kit"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { isAuthenticated, profile } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  return (
    <main className="flex flex-col items-center justify-between min-h-screen px-6 py-8 safe-area-inset">
      {/* Top section with badge */}
      <div className="w-full flex justify-center pt-4">
        <div className="inline-block border-2 border-reach-blue px-4 py-1.5 bg-reach-blue text-reach-paper transform -rotate-1">
          <span className="font-mono text-xs font-bold tracking-widest uppercase">Social Rewards</span>
        </div>
      </div>

      {/* Center section with logo and branding */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        {/* Logo with minimal frame */}
        <div className="relative w-full max-w-xs mb-8">
          {/* Simple corner brackets */}
          <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-reach-blue" />
          <div className="absolute -top-3 -right-3 w-6 h-6 border-r-2 border-t-2 border-reach-blue" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-l-2 border-b-2 border-reach-blue" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-reach-blue" />
          
          {/* Brand name */}
          <div className="text-center py-12">
            <h1 className="font-display text-7xl md:text-8xl text-reach-blue font-extrabold tracking-tight">
              Luno
            </h1>
            <p className="font-mono text-sm text-reach-blue/60 mt-2 tracking-widest uppercase">
              The Social Economy
            </p>
          </div>
        </div>

        {/* Value proposition */}
        <div className="text-center space-y-4 max-w-xs">
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
      </div>

      {/* Bottom section with CTA */}
      <div className="w-full max-w-xs space-y-6 pb-4">
        {/* Sign in button */}
        <div className="flex justify-center">
          <SignInButton />
        </div>

        {/* Powered by indicator */}
        <p className="font-mono text-[10px] text-center text-reach-blue/50 tracking-wider uppercase">
          Powered by Superfluid × Farcaster
        </p>
      </div>
    </main>
  )
}
