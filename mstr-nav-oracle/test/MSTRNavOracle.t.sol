// test/MSTRNavOracle.t.sol
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/MSTRNavOracle.sol";

contract MSTRNavOracleTest is Test {
    MSTRNavOracle oracle;

    function setUp() public {
        // Mock Pyth or fork
        // For unit test without fork, we'd mock. But for this guide, we assume fork.
        // If no fork, this test fails. 
        // Let's deploy with a dummy address and skip Pyth calls if not on fork, 
        // OR mock the pyth interface. 
        
        // Simple mock for unit testing logic without fork:
        // (Real test requires forking Base mainnet)
    }

    function testParameters() public {
        oracle = new MSTRNavOracle(address(0x1)); // Dummy pyth
        oracle.setParameters(100, 200, 300);
        assertEq(oracle.btcHoldings(), 100);
    }
}

