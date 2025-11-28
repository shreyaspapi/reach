"use client"

import Link from "next/link"
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
    <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden h-screen">
      {/* Decorative Corner Elements removed (handled in layout.tsx) */}

      <div className="max-w-4xl w-full text-center space-y-8 z-10">
        {/* Logo / Header */}
        <div className="space-y-6 relative">
          {/* Badge with cross-hatch and solid background */}
          <div className="inline-block border-2 border-reach-blue px-8 py-2 bg-reach-blue text-reach-paper mb-10 transform -rotate-2 relative bg-crosshatch">
            <span className="font-mono font-bold tracking-widest uppercase bg-reach-blue px-2 relative">Est. 2025</span>
          </div>

          {/* Reach Logo with Blueprint Effects */}
          <div className="w-full max-w-3xl mx-auto relative">
            {/* Logo Image */}
            <div className="relative">
              <img
                src="/reach-logo.png"
                alt="Reach - The Currency of Attention"
                className="w-full z-10"
              />

              {/* Cross-hatch overlay */}
              <div className="absolute inset-0 bg-crosshatch text-reach-blue/10 pointer-events-none mix-blend-multiply z-20"></div>

              {/* Construction guide lines - horizontal */}
              <div className="absolute top-0 -left-20 -right-20 h-px border-t border-dashed border-reach-blue/30 pointer-events-none"></div>
              <div className="absolute bottom-0 -left-20 -right-20 h-px border-t border-dashed border-reach-blue/30 pointer-events-none"></div>

              {/* Construction guide lines - vertical */}
              <div className="absolute left-0 -top-20 -bottom-20 w-px border-l border-dashed border-reach-blue/30 pointer-events-none"></div>
              <div className="absolute right-0 -top-20 -bottom-20 w-px border-l border-dashed border-reach-blue/30 pointer-events-none"></div>

              {/* Corner Brackets - Top Left */}
              <div className="absolute -top-4 -left-4 w-12 h-12 border-l-2 border-t-2 border-reach-blue pointer-events-none"></div>

              {/* Corner Brackets - Top Right */}
              <div className="absolute -top-4 -right-4 w-12 h-12 border-r-2 border-t-2 border-reach-blue pointer-events-none"></div>

              {/* Corner Brackets - Bottom Left */}
              <div className="absolute -bottom-4 -left-4 w-12 h-12 border-l-2 border-b-2 border-reach-blue pointer-events-none"></div>

              {/* Corner Brackets - Bottom Right */}
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-r-2 border-b-2 border-reach-blue pointer-events-none"></div>
            </div>
            {/* CTA */}
            <div className="space-y-4">
              <div className="font-mono text-sm md:text-base max-w-md mx-auto leading-relaxed mt-12">
                ACCESS YOUR STREAM. TRACK YOUR POINTS.
                {/* Hatched badge for important text */}
                <span className="bg-reach-blue text-reach-paper px-2 bg-crosshatch inline-block relative ml-2">
                  <span className="relative bg-reach-blue px-1">IDENTITY VERIFICATION REQUIRED.</span>
                </span>
              </div>

              {/* Button with sketchy borders and construction lines */}
              <div className="mt-8 flex justify-center">
                <SignInButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
