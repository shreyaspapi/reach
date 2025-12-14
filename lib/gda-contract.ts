import { ethers } from 'ethers';

// GDAv1 Forwarder ABI (Full JSON ABI)
const GDA_FORWARDER_ABI = [{"inputs":[{"internalType":"contract ISuperfluid","name":"host","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"address","name":"memberAddress","type":"address"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"claimAll","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"connectPool","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"admin","type":"address"},{"components":[{"internalType":"bool","name":"transferabilityForUnitsOwner","type":"bool"},{"internalType":"bool","name":"distributionFromAnyAddress","type":"bool"}],"internalType":"struct PoolConfig","name":"config","type":"tuple"}],"name":"createPool","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"disconnectPool","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"distribute","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"int96","name":"requestedFlowRate","type":"int96"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"distributeFlow","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"name":"estimateDistributionActualAmount","outputs":[{"internalType":"uint256","name":"actualAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"to","type":"address"},{"internalType":"int96","name":"requestedFlowRate","type":"int96"}],"name":"estimateFlowDistributionActualFlowRate","outputs":[{"internalType":"int96","name":"actualFlowRate","type":"int96"},{"internalType":"int96","name":"totalDistributionFlowRate","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"to","type":"address"}],"name":"getFlowDistributionFlowRate","outputs":[{"internalType":"int96","name":"","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"account","type":"address"}],"name":"getNetFlow","outputs":[{"internalType":"int96","name":"","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"}],"name":"getPoolAdjustmentFlowInfo","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"int96","name":"","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pool","type":"address"}],"name":"getPoolAdjustmentFlowRate","outputs":[{"internalType":"int96","name":"","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"address","name":"member","type":"address"}],"name":"isMemberConnected","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"account","type":"address"}],"name":"isPool","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"address","name":"memberAddress","type":"address"},{"internalType":"uint128","name":"newUnits","type":"uint128"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"updateMemberUnits","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

// Superfluid GDAv1 Forwarder Address (Sepolia)
const GDA_FORWARDER_ADDRESS = "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08";

// Wallet Private Key (from env)
// CAUTION: In a production app, this should be a secure backend wallet
const WALLET_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY;
// const RPC_URL = process.env.RPC_URL || "https://rpc.sepolia.org";
const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/BkPg-jAIOhWPnn9X3VbhfA1fjquqGG36";

/**
 * Update member units for a specific pool
 */
export async function updateMemberUnits(poolAddress: string, memberAddress: string, newUnits: number | string | bigint) {
    if (!WALLET_PRIVATE_KEY) {
        console.error("Missing BACKEND_WALLET_PRIVATE_KEY");
        return { success: false, error: "Configuration error" };
    }

    try {
        console.log(`   Using RPC: ${RPC_URL}`);
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        
        // Check network connection first
        const network = await provider.getNetwork();
        console.log(`   Connected to network: ${network.name} (${network.chainId})`);

        const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
        const gdaContract = new ethers.Contract(GDA_FORWARDER_ADDRESS, GDA_FORWARDER_ABI, wallet);

        console.log(`   Updating units for ${memberAddress} in pool ${poolAddress} to ${newUnits}...`);

        // Encode empty bytes for userData
        const userData = "0x";

        // Send transaction
        // Note: units are usually scaled (e.g. if 1 unit = 1 score point)
        // Ensure 'newUnits' fits in uint128
        
        // Check balance first
        const balance = await provider.getBalance(wallet.address);
        console.log(`   Backend wallet balance: ${ethers.formatEther(balance)} ETH`);
        
        if (balance === BigInt(0)) {
             return { success: false, error: "Backend wallet has 0 ETH" };
        }

        const tx = await gdaContract.updateMemberUnits(
            poolAddress,
            memberAddress,
            BigInt(typeof newUnits === "bigint" ? newUnits : Math.round(Number(newUnits))), // Ensure integer
            userData
        );

        console.log(`   Transaction sent: ${tx.hash}`);
        console.log(`   ⏳ Transaction pending (not waiting for confirmation)`);

        return { success: true, txHash: tx.hash };

    } catch (error) {
        console.error("Error updating member units:", error);
        return { success: false, error: String(error) };
    }
}

