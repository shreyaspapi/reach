"use client"

import { useState } from "react"
import type { WrappedData } from "@/types/onchain-wrapped"
import { Button } from "@/components/ui/button"
import { Share2, Download, Check } from "lucide-react"
import { downloadWrappedCard, shareToTwitter, shareToFarcaster, shareToBaseApp, copyDeepLink } from "@/lib/wrapped/utils/share"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FooterCardProps {
  data: WrappedData
  address?: string
}

export function FooterCard({ data, address }: FooterCardProps) {
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const handleDownload = async (format: "jpg" | "png") => {
    setIsDownloading(true)
    try {
      await downloadWrappedCard(address, format)
    } catch (error) {
      console.error("[v0] Download failed:", error)
      alert("Failed to download card. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShareToTwitter = async () => {
    setIsSharing(true)
    try {
      await shareToTwitter(data, address)
    } catch (error) {
      console.error("[v0] Twitter share failed:", error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleShareToFarcaster = async () => {
    setIsSharing(true)
    try {
      await shareToFarcaster(data, address)
    } catch (error) {
      console.error("[v0] Farcaster share failed:", error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleShareToBaseApp = async () => {
    setIsSharing(true)
    try {
      await shareToBaseApp(data, address)
    } catch (error) {
      console.error("[v0] Base App share failed:", error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    if (!address) return

    const success = await copyDeepLink(address)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="blueprint-card p-8 animate-blueprint-fade relative" style={{ animationDelay: "700ms" }}>
      <div className="text-center space-y-6">
        {/* Title with technical dividers */}
        <div className="flex items-center gap-4 justify-center">
          <div className="h-px w-16 bg-foreground" />
          <h2 className="text-2xl font-black uppercase tracking-wider">SHARE RESULTS</h2>
          <div className="h-px w-16 bg-foreground" />
        </div>

        <p className="text-sm font-mono uppercase tracking-wider opacity-60">BROADCAST YOUR ONCHAIN ACTIVITY</p>

        {/* Action buttons with technical styling */}
        <div className="flex flex-wrap justify-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isSharing}
                className="gap-2 border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground uppercase font-bold tracking-wider transition-all duration-300 px-6 py-6"
              >
                <Share2 className="w-5 h-5" strokeWidth={2.5} />
                {isSharing ? "SHARING..." : "SHARE"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem onClick={handleShareToTwitter}>
                <span className="font-bold">X (Twitter)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareToFarcaster}>
                <span className="font-bold">Farcaster</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareToBaseApp}>
                <span className="font-bold">Base App</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            disabled={!address}
            className="gap-2 border-2 border-foreground bg-transparent hover:bg-crosshatch uppercase font-bold tracking-wider transition-all duration-300 px-6 py-6"
          >
            {copied ? (
              <Check className="w-5 h-5" strokeWidth={2.5} />
            ) : (
              <Share2 className="w-5 h-5" strokeWidth={2.5} />
            )}
            {copied ? "COPIED" : "COPY LINK"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isDownloading}
                className="gap-2 border-2 border-foreground bg-transparent hover:bg-crosshatch uppercase font-bold tracking-wider transition-all duration-300 px-6 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    GENERATING...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" strokeWidth={2.5} />
                    DOWNLOAD
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem onClick={() => handleDownload("jpg")} disabled={isDownloading}>
                <span className="font-bold">Download as JPG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("png")} disabled={isDownloading}>
                <span className="font-bold">Download as PNG</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Technical footer annotation */}
      <div className="mt-8 pt-6 border-t-2 border-dashed border-foreground/30 text-center">
        <p className="text-xs font-mono uppercase tracking-widest opacity-40">
          BUILT ON BASE • POWERED BY GOLDRUSH API • GENERATED {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
