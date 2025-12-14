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

export interface PoolData {
    poolAddress: string;
    totalUnits: string;
    totalMembers: string;
    adjustmentFlowRate: string; // in wei per second
    adjustmentFlowRateFormatted: string; // formatted for display
    tokenAddress: string;
}

/**
 * Fetch pool data from Superfluid contract
 */
export async function getPoolData(poolAddress: string): Promise<PoolData | null> {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
        const gdaContract = new ethers.Contract(GDA_FORWARDER_ADDRESS, GDA_FORWARDER_ABI, provider);

        // Fetch data in parallel
        const [totalUnits, totalMembers, tokenAddress, adjustmentFlowRate] = await Promise.all([
            poolContract.getTotalUnits(),
            poolContract.getTotalMembers(),
            poolContract.token(),
            gdaContract.getPoolAdjustmentFlowRate(poolAddress)
        ]);

        // Convert flow rate from wei/second to tokens/second
        // Flow rate is int96, convert to human readable
        const flowRatePerSecond = Number(adjustmentFlowRate) / 1e18;
        const flowRatePerMonth = flowRatePerSecond * 60 * 60 * 24 * 30;

        return {
            poolAddress,
            totalUnits: totalUnits.toString(),
            totalMembers: totalMembers.toString(),
            adjustmentFlowRate: adjustmentFlowRate.toString(),
            adjustmentFlowRateFormatted: `${flowRatePerMonth.toFixed(2)} tokens/month`,
            tokenAddress
        };
    } catch (error) {
        console.error('Error fetching pool data:', error);
        return null;
    }
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
