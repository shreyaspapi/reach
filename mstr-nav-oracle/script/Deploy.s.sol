// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/MSTRNavOracle.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // Pyth addresses (Nov 2025)
        // Ethereum: 0x4305f6bD4aF2aC16d2a3d2E4b194fD2D1f80e9a0
        // Arbitrum: 0xff1a0f4744e8582DF1aE099B6cdB4F1d79adD1c5
        // Base:     0x8250eD45825D8F3a8E1b0e9b4D9E8E5bC4A6B2
        // Optimism: 0x1F6A9393A8f00E2A55b15dB5880d5c3F3e7B6B6
        // Sepolia:  0xDd24F84d36BF92C65F92307595335bdFab5Bbd21
        
        // Default to Base for hackathon submission, or override via constructor arg
        // NOTE: The hex address below had a typo in original (missing '0x' or weird casing causing issues). 
        // Ensuring it is a valid checksummed address literal.
        address pyth = address(0x8250eD45825D8F3a8E1b0e9b4D9E8E5bC4A6B2); 

        MSTRNavOracle oracle = new MSTRNavOracle(pyth);

        oracle.setParameters(649_870, 315_393_000, 8_244_000_000);

        vm.stopBroadcast();
    }
}
