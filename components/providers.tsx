"use client"
import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";
import React from "react";

const config = {
    rpcUrl: "https://mainnet.optimism.io",
    domain: "reach.social",
    siweUri: "https://reach.social/login",
};

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthKitProvider config={config}>
            {children}
        </AuthKitProvider>
    );
}
