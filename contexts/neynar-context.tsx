"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { sdk } from "@farcaster/miniapp-sdk"

interface NeynarUser {
  fid: number
  username: string
  display_name: string
  pfp_url?: string
  custody_address?: string
  verifications?: string[]
  follower_count?: number
  following_count?: number
  signer_uuid?: string
}

interface NeynarContextType {
  user: NeynarUser | null
  isAuthenticated: boolean
  loading: boolean
  isMiniApp: boolean
  signOut: () => void
  refreshUser: () => Promise<void>
}

const NeynarContext = createContext<NeynarContextType | undefined>(undefined)

export function NeynarProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NeynarUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMiniApp, setIsMiniApp] = useState(false)

  // Check if running in Mini App context
  useEffect(() => {
    const checkMiniApp = async () => {
      try {
        const context = await sdk.context
        if (context && context.client) {
          setIsMiniApp(true)
          // In mini app, we can get user info from the context
          if (context.user) {
            // Try to load or fetch user data
            await loadUserFromMiniApp(context.user.fid)
          }
        }
      } catch (e) {
        console.log("Not in mini app context")
      } finally {
        setLoading(false)
      }
    }
    checkMiniApp()
  }, [])

  // Load user data from localStorage
  useEffect(() => {
    if (!isMiniApp) {
      const storedUser = localStorage.getItem('neynar_user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error('Failed to parse stored user data:', error)
          localStorage.removeItem('neynar_user')
        }
      }
      setLoading(false)
    }
  }, [isMiniApp])

  // Listen for auth success events
  useEffect(() => {
    const handleAuthSuccess = (event: any) => {
      if (event.detail) {
        setUser(event.detail)
      }
    }

    window.addEventListener('neynar-auth-success', handleAuthSuccess)
    return () => window.removeEventListener('neynar-auth-success', handleAuthSuccess)
  }, [])

  const loadUserFromMiniApp = async (fid: number) => {
    try {
      // Fetch user data from our API using Neynar
      const response = await fetch(`/api/user/neynar/${fid}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem('neynar_user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Failed to load user from mini app:', error)
    }
  }

  const refreshUser = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/user/neynar/${user.fid}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem('neynar_user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('neynar_user')
  }

  return (
    <NeynarContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        isMiniApp,
        signOut,
        refreshUser
      }}
    >
      {children}
    </NeynarContext.Provider>
  )
}

export function useNeynar() {
  const context = useContext(NeynarContext)
  if (context === undefined) {
    throw new Error('useNeynar must be used within a NeynarProvider')
  }
  return context
}

