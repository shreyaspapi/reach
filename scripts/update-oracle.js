const { ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config({ path: ".env.local" }); // Load from .env.local

// Configuration
const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/BkPg-jAIOhWPnn9X3VbhfA1fjquqGG36";
const PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY;
const CONTRACT_ADDRESS = "0x21c1914f8f1a6cd3faaa08c761ec0990d01fab8f"; // Sepolia

// Pyth Feed IDs
const BTC_FEED_ID = "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
const MSTR_FEED_ID = "e1e80251e5f5184f2195008382538e847fafc36f751896889dd3d1b1f6111f09";

// ABI for updatePriceFeeds
const ABI = [
    "function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable",
    "function getMstrNavAndMnav() external view returns (uint256 navPerShareUsd, uint256 mnavMultiple, uint64 btcPublishTime, uint64 mstrPublishTime)"
];

async function main() {
    if (!PRIVATE_KEY) {
        console.error("Missing BACKEND_WALLET_PRIVATE_KEY env var");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    console.log(`Using wallet: ${wallet.address}`);
    console.log(`Contract: ${CONTRACT_ADDRESS}`);

    try {
        // 1. Fetch update data from Pyth Hermes
        console.log("Fetching price updates from Pyth Hermes...");
        const response = await axios.get(
            `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${BTC_FEED_ID}&ids[]=${MSTR_FEED_ID}`
        );

        const updateData = response.data.binary.data; // Array of hex strings
        const updateDataBytes = updateData.map(d => "0x" + d);

        console.log("Got update data. Estimating fee...");

        // 2. Estimate fee (Pyth fee is usually 1 wei per update, but check docs/contract)
        // The Pyth contract charges a fee. We can calculate it or just send some value.
        // Usually, we query the Pyth contract for the fee, but here we can just send a small amount or simulate.
        // Let's try to simulate or just send a standard fee (e.g. 0.0001 ETH).
        // Better: The contract calls `pyth.updatePriceFeeds{value: msg.value}`.
        // We need to know the fee.

        // Since we don't have the Pyth interface here easily to call `getUpdateFee`, 
        // we'll fetch the fee from the Pyth contract if we can, OR just send a safe amount.
        // Pyth on Sepolia: 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21

        const pythAbi = ["function getUpdateFee(bytes[] calldata updateData) external view returns (uint256 feeAmount)"];
        const pythContract = new ethers.Contract("0xDd24F84d36BF92C65F92307595335bdFab5Bbd21", pythAbi, provider);

        const fee = await pythContract.getUpdateFee(updateDataBytes);
        console.log(`Required fee: ${ethers.formatEther(fee)} ETH`);

        // 3. Update Price Feeds
        console.log("Updating price feeds on-chain...");
        const tx = await contract.updatePriceFeeds(updateDataBytes, { value: fee });
        console.log(`Tx sent: ${tx.hash}`);
        await tx.wait();
        console.log("Price feeds updated successfully!");

        // 4. Verify
        const result = await contract.getMstrNavAndMnav();
        console.log("New Contract Data:");
        console.log(`NAV: $${(Number(result.navPerShareUsd) / 1e8).toFixed(2)}`);
        console.log(`Multiple: ${(Number(result.mnavMultiple) / 100).toFixed(2)}x`);

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
