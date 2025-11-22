"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import React from "react"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
            config={{
                appearance: {
                    theme: "light",
                    accentColor: "#0047BB",
                    logo: "/reach-logo.png",
                },
                loginMethods: ['twitter', 'farcaster'],
                embeddedWallets: {
                    createOnLogin: "users-without-wallets",
                },
            }}
        >
            {children}
        </PrivyProvider>
    )
}
