import { ethers } from 'ethers';

// Superfluid Pool ABI - minimal interface for reading pool data
const POOL_ABI = [
    "function getTotalUnits() view returns (uint128)",
    "function getUnits(address member) view returns (uint128)",
    "function getTotalMembers() view returns (uint256)",
    "function getConnectedFlowRate() view returns (int96)",
    "function getTotalFlowRate() view returns (int96)",
    "function token() view returns (address)"
];

// GDA Forwarder ABI - for getting pool adjustment flow rate
const GDA_FORWARDER_ABI = [
    "function getPoolAdjustmentFlowRate(address pool) view returns (int96)"
];

const GDA_FORWARDER_ADDRESS = "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08";
const RPC_URL = process.env.RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/BkPg-jAIOhWPnn9X3VbhfA1fjquqGG36";
const SUPERFLUID_SUBGRAPH_URL = process.env.SUPERFLUID_SUBGRAPH_URL || "https://subgraph-endpoints.superfluid.dev/eth-sepolia/protocol-v1";

export interface PoolData {
    poolAddress: string;
    totalUnits: string;
    totalMembers: string;
    adjustmentFlowRate: string; // in wei per second
    adjustmentFlowRateFormatted: string; // formatted for display
    tokenAddress: string;
}

/**
 * Fetch pool data from The Graph (Superfluid subgraph)
 * Replaces RPC call for better reliability
 */
export async function getPoolDataFromGraph(poolAddress: string): Promise<PoolData | null> {
    try {
        const query = `
        {
          pool(id: "${poolAddress.toLowerCase()}") {
            id
            totalUnits
            token {
              id
            }
            poolMembers {
              id
            }
            flowRate
          }
        }`;

        const res = await fetch(SUPERFLUID_SUBGRAPH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });

        if (!res.ok) {
            console.error("Graph query failed", await res.text());
            return null;
        }

        const json = await res.json();
        const pool = json?.data?.pool;
        
        if (!pool) {
            console.warn(`Pool ${poolAddress} not found in subgraph`);
            return null;
        }

        // Calculate member count
        const totalMembers = pool.poolMembers ? pool.poolMembers.length.toString() : "0";
        
        // Get flow rate (default to 0 if not indexed on pool directly)
        // Note: 'flowRate' might not be standard on Pool entity in all subgraph versions
        // If it fails, we fall back to 0
        const flowRate = pool.flowRate || "0";
        
        // Convert flow rate from wei/second to human readable per month
        const flowRatePerSecond = Number(flowRate) / 1e18;
        const flowRatePerMonth = flowRatePerSecond * 60 * 60 * 24 * 30;

        return {
            poolAddress: pool.id,
            totalUnits: pool.totalUnits || "0",
            totalMembers: totalMembers,
            adjustmentFlowRate: flowRate,
            adjustmentFlowRateFormatted: `${flowRatePerMonth.toFixed(2)} tokens/month`,
            tokenAddress: pool.token?.id || ""
        };
    } catch (err) {
        console.error("Error fetching graph pool data:", err);
        return null;
    }
}

/**
 * Fetch pool data (Proxy to Graph implementation)
 */
export async function getPoolData(poolAddress: string): Promise<PoolData | null> {
    return getPoolDataFromGraph(poolAddress);
}

/**
 * Get member units in a pool
 */
export async function getMemberUnits(poolAddress: string, memberAddress: string): Promise<string | null> {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
        
        const units = await poolContract.getUnits(memberAddress);
        return units.toString();
    } catch (error) {
        console.error('Error fetching member units:', error);
        return null;
    }
}

/**
 * Calculate member's share of the pool
 */
export function calculateMemberShare(memberUnits: string, totalUnits: string, poolTotal: string): string {
    if (totalUnits === "0") return "0";
    
    const unitsNum = BigInt(memberUnits);
    const totalUnitsNum = BigInt(totalUnits);
    
    // Calculate percentage share
    const sharePercent = (Number(unitsNum) / Number(totalUnitsNum)) * 100;
    
    return `${sharePercent.toFixed(2)}%`;
}

/**
 * Fetch pool members and units from The Graph (Superfluid subgraph)
 * Note: depends on the pool being indexed; uses sepolia by default
 */
export async function getPoolMembersFromGraph(poolAddress: string): Promise<{
    totalUnits: string;
    members: Array<{ address: string; units: string }>;
} | null> {
    try {
        const query = `
        {
          pool(id: "${poolAddress.toLowerCase()}") {
            id
            totalUnits
            members {
              account {
                id
              }
              units
            }
          }
        }`;

        const res = await fetch(SUPERFLUID_SUBGRAPH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });

        if (!res.ok) {
            console.error("Graph query failed", await res.text());
            return null;
        }

        const json = await res.json();
        const pool = json?.data?.pool;
        if (!pool) return null;

        return {
            totalUnits: pool.totalUnits || "0",
            members: (pool.members || []).map((m: any) => ({
                address: m.account?.id,
                units: m.units
            }))
        };
    } catch (err) {
        console.error("Error fetching graph pool members:", err);
        return null;
    }
}
