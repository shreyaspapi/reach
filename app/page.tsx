"use client"

import { SignInButton, useProfile } from "@farcaster/auth-kit"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { sdk } from "@farcaster/miniapp-sdk"

export default function LoginPage() {
  const { isAuthenticated } = useProfile()
  const router = useRouter()
  const [isMiniApp, setIsMiniApp] = useState(false)

  // Check for Mini App context and handle auto-redirect
  useEffect(() => {
    const checkMiniApp = async () => {
      try {
        const context = await sdk.context
        if (context && context.client) {
          setIsMiniApp(true)
          
          // Trigger the native "Confirm it's you" dialog
          // We need a nonce for the sign-in request
          const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
          try {
              // This triggers the native bottom sheet
              const result = await sdk.actions.signIn({ 
                  nonce,
                  acceptAuthAddress: true 
              });
              
              console.log("Mini App Sign In Result:", result);
              
              // Verify the signature with our backend
              const verifyRes = await fetch("/api/auth/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  message: result.message,
                  signature: result.signature,
                  nonce,
                  domain: "farcaster.luno.social",
                }),
              });

              if (!verifyRes.ok) {
                throw new Error("Verification failed");
              }

              const verifyData = await verifyRes.json();
              console.log("Verified User:", verifyData);

              // Redirect to dashboard upon success
              router.push("/dashboard")
          } catch (signInError) {
              console.error("Sign in rejected or failed", signInError);
              // If they reject, we stay on the login page
          }
        }
      } catch (e) {
        console.error("Not in mini app", e)
      }
    }
    checkMiniApp()
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

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
          <SignInButton />
          
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
