"use client"

import { useQuery } from "@tanstack/react-query"
import type { OnchainWrappedData } from "@/types/onchain-wrapped"

export function useWrappedData(address?: string) {
  return useQuery({
    queryKey: ["wrapped-data", address, "v2"], // Added version to invalidate cache
    queryFn: async () => {
      if (!address) throw new Error("No address provided")

      // Fetch data from API route
      const response = await fetch(`/api/wrapped/${address}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error("Failed to fetch wrapped data")
      }

      const rawData = await response.json()

      // Data is already processed by the API route
      return rawData as OnchainWrappedData
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  })
}
