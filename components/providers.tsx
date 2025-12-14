"use client"
import { AuthKitProvider } from "@farcaster/auth-kit";
import { sdk } from "@farcaster/miniapp-sdk";
import "@farcaster/auth-kit/styles.css";
import React, { useEffect } from "react";

const config = {
    rpcUrl: "https://mainnet.optimism.io",
    domain: "luno.social",
    siweUri: "https://luno.social/login",
};

// Component to handle Mini App SDK ready signal
function MiniAppReady({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Call ready() to hide the Farcaster splash screen
        const initMiniApp = async () => {
            try {
                await sdk.actions.ready();
            } catch (error) {
                // If not running in a Mini App context, just proceed
                console.log("Mini App SDK ready() called (may not be in Mini App context):", error);
            }
        };

        initMiniApp();
    }, []);

    // Render children immediately - ready() just hides the splash screen
    return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthKitProvider config={config}>
            <MiniAppReady>
                {children}
            </MiniAppReady>
        </AuthKitProvider>
    );
}
