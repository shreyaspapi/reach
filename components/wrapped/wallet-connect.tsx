"use client"

import type React from "react"
import type { ReactNode } from "react"
import { useState } from "react"
import { useAccount, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogOut, ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"

interface WalletConnectProps {
  children: ReactNode
  onManualAddress?: (address: string) => void
}

export function WalletConnect({ children, onManualAddress }: WalletConnectProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [manualAddress, setManualAddress] = useState("")
  const [hasSubmittedManualAddress, setHasSubmittedManualAddress] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const trimmedAddress = manualAddress.trim()
  const isBaseName = trimmedAddress.length > 0 && trimmedAddress.endsWith(".base.eth")

  const handleManualAddressSubmit = async () => {
    if (!trimmedAddress || isSubmitting) return

    console.log("[v0] Submitting address:", trimmedAddress)

    if (onManualAddress) {
      setIsAnimating(true)
      setIsSubmitting(true)
      setHasSubmittedManualAddress(true)
      onManualAddress(trimmedAddress)
      setTimeout(() => {
        setIsSubmitting(false)
        setIsAnimating(false)
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualAddressSubmit()
    }
  }

  if (!isConnected && !hasSubmittedManualAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 sm:h-10 px-3 sm:px-4 border border-foreground/20 bg-background/50 hover:bg-foreground hover:text-background transition-all font-mono rounded-lg text-xs sm:text-sm uppercase tracking-wide"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
        </div>

        <div
          className="absolute inset-0 opacity-[0.04] animate-pulse"
          style={{
            backgroundImage: `
            linear-gradient(to right, var(--foreground) 1px, transparent 1px),
            linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
          `,
            backgroundSize: "48px 48px",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute top-4 left-4 sm:top-8 sm:left-8 w-12 h-12 sm:w-16 sm:h-16 border-l-2 border-t-2 border-foreground/20 animate-pulse"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 sm:w-16 sm:h-16 border-r-2 border-t-2 border-foreground/20 animate-pulse"
          style={{ animationDuration: "3s", animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-12 h-12 sm:w-16 sm:h-16 border-l-2 border-b-2 border-foreground/20 animate-pulse"
          style={{ animationDuration: "3s", animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-16 sm:h-16 border-r-2 border-b-2 border-foreground/20 animate-pulse"
          style={{ animationDuration: "3s", animationDelay: "1.5s" }}
        />

        <div className="relative z-10 w-full max-w-2xl animate-blueprint-fade">
          <div className="space-y-12 sm:space-y-16">
            <div className="text-center space-y-8 sm:space-y-10">
              <div className="inline-flex items-center justify-center group">
                <div className="relative">
                  <div
                    className="absolute -inset-4 border border-foreground/10 rounded-full animate-ping"
                    style={{ animationDuration: "3s" }}
                  />
                  <div className="absolute -inset-2 border border-foreground/20 rounded-full" />

                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 transition-transform duration-500 group-hover:scale-110">
                    <svg viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path
                        d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                        fill="var(--foreground)"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground uppercase leading-none">
                  <span className="inline-block animate-blueprint-fade" style={{ animationDelay: "0.1s" }}>
                    2025
                  </span>
                  <br />
                  <span
                    className="inline-block text-outlined-hatched animate-blueprint-fade"
                    style={{ animationDelay: "0.2s" }}
                  >
                    WRAPPED
                  </span>
                </h1>

                <div
                  className="flex items-center justify-center gap-3 animate-blueprint-fade"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div
                    className="h-px bg-foreground w-8 sm:w-12 origin-left animate-pulse"
                    style={{ animationDuration: "2s" }}
                  />
                  <p className="text-xs sm:text-sm text-foreground/60 font-mono uppercase tracking-[0.2em]">
                    YOUR YEAR ON BASE
                  </p>
                  <div
                    className="h-px bg-foreground w-8 sm:w-12 origin-right animate-pulse"
                    style={{ animationDuration: "2s" }}
                  />
                </div>
              </div>
            </div>

            <div
              className="bg-background/80 backdrop-blur-sm border-2 border-foreground rounded-2xl p-6 sm:p-8 md:p-10 relative shadow-[6px_6px_0_0_rgba(0,71,187,0.12)] transition-shadow hover:shadow-[8px_8px_0_0_rgba(0,71,187,0.18)] animate-blueprint-fade"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-foreground/30 transition-opacity group-hover:opacity-100" />
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-foreground/30 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-foreground/30 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-foreground/30 transition-opacity group-hover:opacity-100" />

              <div className="space-y-5 sm:space-y-6">
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="0x... or username.base.eth"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-12 sm:h-14 font-mono text-sm sm:text-base border-2 border-foreground/20 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground bg-background/50 backdrop-blur uppercase placeholder:text-foreground/20 placeholder:lowercase transition-all duration-300"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                  </div>
                </div>

                <Button
                  onClick={handleManualAddressSubmit}
                  size="lg"
                  disabled={!trimmedAddress || isSubmitting}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-black uppercase bg-foreground hover:bg-foreground/90 text-background border-2 border-foreground rounded-xl transition-all duration-300 shadow-[3px_3px_0_0_rgba(0,71,187,0.2)] hover:shadow-[5px_5px_0_0_rgba(0,71,187,0.3)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[1px_1px_0_0_rgba(0,71,187,0.2)] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_0_rgba(0,71,187,0.2)] relative overflow-hidden group"
                >
                  {isAnimating && (
                    <div
                      className="absolute inset-0 bg-background/20 animate-ping"
                      style={{ animationDuration: "0.6s" }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Generate Onchain Wrapped"
                    )}
                  </span>
                  <div className="absolute inset-0 bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Button>

                <p className="text-center text-xs text-foreground/40 font-mono uppercase tracking-wider">
                  Enter wallet address or Base Name
                </p>
              </div>
            </div>

            <div className="text-center animate-blueprint-fade" style={{ animationDelay: "0.5s" }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-foreground/10 rounded-full">
                <div
                  className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-pulse"
                  style={{ animationDuration: "2s" }}
                />
                <p className="text-xs text-foreground/40 font-mono uppercase tracking-widest">System v1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 bg-background/80 backdrop-blur-md border-b border-foreground/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10">
              <svg viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path
                  d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                  fill="var(--foreground)"
                />
              </svg>
            </div>
            <span className="hidden sm:block text-sm font-mono uppercase tracking-wider text-foreground/60">
              2025 Wrapped
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/wrapped/leaderboard">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9 sm:h-10 px-3 sm:px-4 border border-foreground/20 bg-background/50 hover:bg-foreground hover:text-background transition-all font-mono rounded-lg text-xs sm:text-sm uppercase tracking-wide"
              >
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9 sm:h-10 px-3 sm:px-4 border border-foreground/20 bg-background/50 hover:bg-foreground hover:text-background transition-all font-mono rounded-lg text-xs sm:text-sm uppercase tracking-wide"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>

            <Button
              onClick={() => {
                if (isConnected) {
                  disconnect()
                }
                setHasSubmittedManualAddress(false)
                setManualAddress("")
              }}
              variant="outline"
              size="sm"
              className="gap-2 h-9 sm:h-10 px-3 sm:px-4 border border-foreground/20 bg-background/50 hover:bg-foreground hover:text-background transition-all font-mono rounded-lg text-xs sm:text-sm uppercase tracking-wide"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="pt-16 sm:pt-20">{children}</div>
    </>
  )
}
