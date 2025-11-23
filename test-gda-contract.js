const { ethers } = require('ethers');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// GDAv1 Forwarder ABI (Full JSON ABI)
const GDA_FORWARDER_ABI = [{"inputs":[{"internalType":"contract ISuperfluid","name":"host","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"address","name":"memberAddress","type":"address"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"claimAll","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"connectPool","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"admin","type":"address"},{"components":[{"internalType":"bool","name":"transferabilityForUnitsOwner","type":"bool"},{"internalType":"bool","name":"distributionFromAnyAddress","type":"bool"}],"internalType":"struct PoolConfig","name":"config","type":"tuple"}],"name":"createPool","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"disconnectPool","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"distribute","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"int96","name":"requestedFlowRate","type":"int96"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"distributeFlow","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"name":"estimateDistributionActualAmount","outputs":[{"internalType":"uint256","name":"actualAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"to","type":"address"},{"internalType":"int96","name":"requestedFlowRate","type":"int96"}],"name":"estimateFlowDistributionActualFlowRate","outputs":[{"internalType":"int96","name":"actualFlowRate","type":"int96"},{"internalType":"int96","name":"totalDistributionFlowRate","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"contract ISuperfluidPool","name":"to","type":"address"}],"name":"getFlowDistributionFlowRate","outputs":[{"internalType":"int96","name":"","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"account","type":"address"}],"name":"getNetFlow","outputs":[{"internalType":"int96","name":"","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"}],"name":"getPoolAdjustmentFlowInfo","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"int96","name":"","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pool","type":"address"}],"name":"getPoolAdjustmentFlowRate","outputs":[{"internalType":"int96","name":"","type":"int96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"address","name":"member","type":"address"}],"name":"isMemberConnected","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidToken","name":"token","type":"address"},{"internalType":"address","name":"account","type":"address"}],"name":"isPool","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluidPool","name":"pool","type":"address"},{"internalType":"address","name":"memberAddress","type":"address"},{"internalType":"uint128","name":"newUnits","type":"uint128"},{"internalType":"bytes","name":"userData","type":"bytes"}],"name":"updateMemberUnits","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

// Superfluid GDAv1 Forwarder Address (Sepolia)
const GDA_FORWARDER_ADDRESS = "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08";

// REACH Pool Address (Sepolia)
const REACH_POOL_ADDRESS = "0x2cc199976B4ACBe4211E943c1E7F070d76570D4e";

// RPC URL
const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/BkPg-jAIOhWPnn9X3VbhfA1fjquqGG36";

// Member address to update (use your embedded wallet address or any address)
const MEMBER_ADDRESS = "0x33fFc7fb5A1998D8eA15D6e6Ca528f3bd48a2Ff0"; 

async function runTest() {
    console.log("🧪 Starting GDA Contract Test...");
    
    const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ Missing BACKEND_WALLET_PRIVATE_KEY in .env.local");
        return;
    }

    try {
        // 1. Connect to RPC
        console.log(`\n1️⃣ Connecting to RPC...`);
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const network = await provider.getNetwork();
        console.log(`   ✅ Connected to ${network.name} (${network.chainId})`);

        // 2. Setup Wallet
        console.log(`\n2️⃣ Setting up wallet...`);
        const wallet = new ethers.Wallet(privateKey, provider);
        const balance = await provider.getBalance(wallet.address);
        console.log(`   Address: ${wallet.address}`);
        console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);

        if (balance === BigInt(0)) {
            console.error("   ❌ Wallet has 0 ETH! Cannot send transaction.");
            return;
        }

        // 3. Connect Contract
        console.log(`\n3️⃣ Connecting to GDA Forwarder Contract...`);
        const gdaContract = new ethers.Contract(GDA_FORWARDER_ADDRESS, GDA_FORWARDER_ABI, wallet);
        console.log(`   Contract Address: ${GDA_FORWARDER_ADDRESS}`);

        // 4. Send Transaction
        const newUnits = 100; // Test value
        console.log(`\n4️⃣ Sending 'updateMemberUnits' transaction...`);
        console.log(`   Pool: ${REACH_POOL_ADDRESS}`);
        console.log(`   Member: ${MEMBER_ADDRESS}`);
        console.log(`   New Units: ${newUnits}`);

        const tx = await gdaContract.updateMemberUnits(
            REACH_POOL_ADDRESS,
            MEMBER_ADDRESS,
            BigInt(newUnits),
            "0x" // userData
        );

        console.log(`\n🚀 Transaction sent! Hash: ${tx.hash}`);
        console.log(`   Waiting for confirmation...`);

        const receipt = await tx.wait();
        console.log(`\n✅ Transaction confirmed!`);
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`   Explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);

    } catch (error) {
        console.error("\n❌ Error failed:", error);
    }
}

runTest();

