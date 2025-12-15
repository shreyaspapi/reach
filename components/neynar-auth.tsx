"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

export function NeynarAuth() {
  const router = useRouter()
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Check for Mini App context
  useEffect(() => {
    const checkMiniApp = async () => {
      try {
        const context = await sdk.context
        if (context && context.client) {
          setIsMiniApp(true)
        }
      } catch (e) {
        console.log("Not in mini app context")
      }
    }
    checkMiniApp()
  }, [])

  const handleSignIn = async (event: MessageEvent) => {
    // Accept messages from Neynar and localhost for development
    if (!["https://app.neynar.com", "http://localhost:3000"].includes(event.origin)) return

    const data = event.data
    console.log("Received message:", data)

    // Handle different message formats from Neynar
    if (data.type === "neynar:signIn:success" || data.signer_uuid) {
      console.log("Neynar sign in success:", data)

      try {
        setIsAuthenticating(true)
        
        // Verify the signer with our backend
        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signer_uuid: data.signer_uuid,
            fid: data.fid,
          }),
        })

        if (!verifyRes.ok) {
          const errorData = await verifyRes.json()
          console.error("Verification failed:", errorData)
          throw new Error("Verification failed")
        }

        const verifyData = await verifyRes.json()
        console.log("Verified User:", verifyData)

        // Store user data in localStorage
        localStorage.setItem('neynar_user', JSON.stringify(verifyData))

        // Close popup if it exists
        if (window.opener) {
          window.close()
        }

        // Trigger a custom event for the context to pick up
        window.dispatchEvent(new CustomEvent('neynar-auth-success', { detail: verifyData }))

        // Redirect to dashboard upon success
        router.push("/dashboard")
      } catch (error) {
        console.error("Verification failed:", error)
        alert("Authentication failed. Please try again.")
      } finally {
        setIsAuthenticating(false)
      }
    }
  }

  useEffect(() => {
    window.addEventListener("message", handleSignIn)
    return () => window.removeEventListener("message", handleSignIn)
  }, [])

  const openSignIn = () => {
    const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || ""
    const authUrl = `https://app.neynar.com/login/?client_id=${clientId}`
    window.open(authUrl, "neynar-auth", "width=400,height=600")
  }

  if (isMiniApp) {
    // For mini apps, authenticate using Mini App SDK with Neynar backend
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={async () => {
            try {
              setIsAuthenticating(true)
              
              // Get the user's FID from Mini App context
              const context = await sdk.context
              if (!context || !context.user) {
                throw new Error("Unable to get user from Mini App context")
              }

              const fid = context.user.fid
              console.log("Mini App user FID:", fid)

              // Verify and fetch user data through Neynar
              const verifyRes = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fid: fid,
                  mini_app: true,
                }),
              })

              if (!verifyRes.ok) {
                const errorData = await verifyRes.json()
                console.error("Verification failed:", errorData)
                throw new Error("Verification failed")
              }

              const userData = await verifyRes.json()
              console.log("Verified user:", userData)

              // Store user data
              localStorage.setItem('neynar_user', JSON.stringify(userData))

              // Trigger auth success event
              window.dispatchEvent(new CustomEvent('neynar-auth-success', { detail: userData }))

              // Navigate to dashboard
              router.push("/dashboard")
            } catch (error) {
              console.error("Mini app sign in failed:", error)
              alert("Authentication failed. Please try again.")
            } finally {
              setIsAuthenticating(false)
            }
          }}
          disabled={isAuthenticating}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-widest transition-colors"
        >
          {isAuthenticating ? "Signing In..." : "Sign In with Farcaster"}
        </button>
      </div>
    )
  }

  // For web browsers, use Neynar SIWN
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={openSignIn}
        disabled={isAuthenticating}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-widest transition-colors"
      >
        {isAuthenticating ? "Signing In..." : "Sign In with Neynar"}
      </button>
    </div>
  )
}
