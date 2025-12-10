import { useState, useEffect, useCallback } from 'react'
import { useProfile } from '@farcaster/auth-kit'
import { normalizeAddress } from '@/lib/utils'

const SUPERFLUID_SUBGRAPH_URL = 'https://subgraph-endpoints.superfluid.dev/eth-sepolia/protocol-v1'
const LUNO_TOKEN_ADDRESS = '0xe58c945fbb1f2c5e7398f1a4b9538f52778b31a7'
const POOL_ADDRESS = '0x2cc199976b4acbe4211e943c1e7f070d76570d4e'

interface PoolMemberData {
    units: string
    totalAmountReceivedUntilUpdatedAt: string
    updatedAtTimestamp: string
    pool: {
        flowRate: string
        totalUnits: string
    }
}

export function useLunoStream() {
    const { profile } = useProfile()
    const [data, setData] = useState<PoolMemberData | null>(null)
    const [flowRate, setFlowRate] = useState<bigint>(BigInt(0))
    const [balance, setBalance] = useState<string>("0")
    const [loading, setLoading] = useState(true)

    const fetchStreamData = useCallback(async () => {
        const rawAddress = profile?.verifications?.[0] || profile?.custody
        const walletAddress = normalizeAddress(rawAddress)
        if (!walletAddress) return

        const query = `
            query GetMemberFlow($pool: String!, $account: String!) {
                poolMembers(
                    where: {
                        pool: $pool
                        account: $account
                    }
                ) {
                    units
                    totalAmountReceivedUntilUpdatedAt
                    updatedAtTimestamp
                    pool {
                        flowRate
                        totalUnits
                    }
                }
            }
        `

        try {
            const response = await fetch(SUPERFLUID_SUBGRAPH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    variables: {
                        pool: POOL_ADDRESS.toLowerCase(),
                        account: walletAddress.toLowerCase()
                    }
                })
            })

            const result = await response.json()
            const member = result.data?.poolMembers?.[0]

            if (member) {
                setData(member)

                // Calculate flow rate for this member: PoolFlowRate * (MemberUnits / TotalUnits)
                const poolFlowRate = BigInt(member.pool.flowRate)
                const memberUnits = BigInt(member.units)
                const totalUnits = BigInt(member.pool.totalUnits)

                if (totalUnits > BigInt(0)) {
                    const memberFlowRate = (poolFlowRate * memberUnits) / totalUnits
                    setFlowRate(memberFlowRate)
                }
            }
        } catch (error) {
            console.error("Error fetching stream data:", error)
        } finally {
            setLoading(false)
        }
    }, [profile])

    useEffect(() => {
        fetchStreamData()
        const interval = setInterval(fetchStreamData, 10000) // Refresh every 10s
        return () => clearInterval(interval)
    }, [fetchStreamData])

    // Animation loop
    useEffect(() => {
        if (!data) return

        const updateBalance = () => {
            // Use milliseconds for smoother animation
            const now = Date.now()
            const updatedAt = parseInt(data.updatedAtTimestamp) * 1000
            const timeDiff = BigInt(Math.max(0, now - updatedAt))

            const totalStreamed = BigInt(data.totalAmountReceivedUntilUpdatedAt)
            // flowRate is per second, so we multiply by ms and divide by 1000
            const accrued = (timeDiff * flowRate) / BigInt(1000)
            const currentBalance = totalStreamed + accrued

            // Convert to formatted string (18 decimals)
            const balanceInEther = Number(currentBalance) / 1e18
            setBalance(balanceInEther.toFixed(6))
        }

        const animation = setInterval(updateBalance, 50) // Update UI every 50ms for smoothness
        updateBalance() // Initial call

        return () => clearInterval(animation)
    }, [data, flowRate])

    return {
        balance,
        flowRate: Number(flowRate) / 1e18, // formatted flow rate
        loading,
        hasStream: !!data
    }
}

