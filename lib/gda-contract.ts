import { ethers } from 'ethers';

// GDAv1 Forwarder ABI (minimal for updateMemberUnits)
const GDA_FORWARDER_ABI = [
  "function updateMemberUnits(address pool, address memberAddress, uint128 newUnits, bytes calldata userData) external returns (bool)"
];

// Superfluid GDAv1 Forwarder Address (Sepolia)
const GDA_FORWARDER_ADDRESS = "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08";

// REACH Pool Address (Sepolia)
const REACH_POOL_ADDRESS = "0x2cc199976B4ACBe4211E943c1E7F070d76570D4e";

// Wallet Private Key (from env)
// CAUTION: In a production app, this should be a secure backend wallet
const WALLET_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || "https://rpc.sepolia.org";

export async function updateMemberUnits(memberAddress: string, newUnits: number) {
    if (!WALLET_PRIVATE_KEY) {
        console.error("Missing BACKEND_WALLET_PRIVATE_KEY");
        return { success: false, error: "Configuration error" };
    }

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
        const gdaContract = new ethers.Contract(GDA_FORWARDER_ADDRESS, GDA_FORWARDER_ABI, wallet);

        console.log(`Updating units for ${memberAddress} to ${newUnits}...`);

        // Encode empty bytes for userData
        const userData = "0x";

        // Send transaction
        // Note: units are usually scaled (e.g. if 1 unit = 1 score point)
        // Ensure 'newUnits' fits in uint128
        const tx = await gdaContract.updateMemberUnits(
            REACH_POOL_ADDRESS,
            memberAddress,
            BigInt(Math.round(newUnits)), // Ensure integer
            userData
        );

        console.log(`Transaction sent: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        return { success: true, txHash: receipt.hash };

    } catch (error) {
        console.error("Error updating member units:", error);
        return { success: false, error: String(error) };
    }
}

