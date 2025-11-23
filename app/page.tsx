"use client"

import Link from "next/link"
import { TwitterIcon } from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { login, authenticated, ready } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard")
    }
  }, [ready, authenticated, router])

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
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <div className="font-mono text-sm md:text-base max-w-md mx-auto leading-relaxed">
            The SocialFi Layer for the New Internet.
            <br />
            <span className="opacity-70">Where attention meets DeFi yield.</span>
            {/* Hatched badge for important text */}
            <div className="mt-4">
              <span className="bg-reach-blue text-reach-paper px-2 bg-crosshatch inline-block relative">
                <span className="relative bg-reach-blue px-1 font-bold">Identity Verification Required</span>
              </span>
            </div>
          </div>

          {/* Button with sketchy borders and construction lines */}
          <button
            onClick={login}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-transparent overflow-hidden transition-all hover:bg-reach-blue cursor-pointer border-sketchy guide-corners"
          >
            <span className="absolute inset-1 border border-reach-blue border-dashed group-hover:border-reach-paper/30 opacity-60"></span>

            <div className="relative flex items-center gap-3">
              <TwitterIcon className="w-5 h-5 text-reach-blue group-hover:text-reach-paper transition-colors" />
              <span className="font-mono font-bold text-lg text-reach-blue group-hover:text-reach-paper transition-colors">
                Connect
              </span>
            </div>
          </button>

          {/* Debug Button */}
          <div className="pt-2">
            <Link href="/dashboard" className="font-mono text-xs text-reach-blue/50 hover:text-reach-blue underline">
              [DEBUG] Skip Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
