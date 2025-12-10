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
          <span className="font-mono text-xs font-bold tracking-widest uppercase">Est. 2025</span>
        </div>
      </div>

      {/* Center section with logo */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs mx-auto">
        {/* Logo with minimal frame */}
        <div className="relative w-full">
          {/* Simple corner brackets */}
          <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-reach-blue" />
          <div className="absolute -top-3 -right-3 w-6 h-6 border-r-2 border-t-2 border-reach-blue" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-l-2 border-b-2 border-reach-blue" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-reach-blue" />
          
          <img
            src="/reach-logo.png"
            alt="Reach - The Currency of Attention"
            className="w-full"
          />
        </div>
      </div>

      {/* Bottom section with CTA */}
      <div className="w-full max-w-xs space-y-6 pb-4">
        {/* Tagline */}
        <p className="font-mono text-xs text-center leading-relaxed text-reach-blue/80">
          Stream your engagement rewards.<br />
          Track your points. Get paid for attention.
        </p>

        {/* Sign in button */}
        <div className="flex justify-center">
          <SignInButton />
        </div>

        {/* Powered by indicator */}
        <p className="font-mono text-[10px] text-center text-reach-blue/50 tracking-wider uppercase">
          Powered by Superfluid
        </p>
      </div>
    </main>
  )
}
