"use client"

import { Suspense, useState } from "react"
import { WalletConnect } from "@/components/wrapped/wallet-connect"
import { WrappedDashboard } from "@/components/wrapped/wrapped-dashboard"
import { WrappedProviders } from "@/components/wrapped/wallet-provider"

export default function WrappedPage() {
  const [manualAddress, setManualAddress] = useState<string>()

  return (
    <WrappedProviders>
      <main className="min-h-screen">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <WalletConnect onManualAddress={setManualAddress}>
            <WrappedDashboard manualAddress={manualAddress} />
          </WalletConnect>
        </Suspense>
      </main>
    </WrappedProviders>
  )
}

