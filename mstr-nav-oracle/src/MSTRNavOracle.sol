// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MSTRNavOracle is Ownable {
    IPyth public immutable pyth;

    bytes32 public constant BTC_FEED  = 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43;
    bytes32 public constant MSTR_FEED = 0x0d0f4e8f931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace; // Live Equity.MSTR.US

    uint256 public btcHoldings    = 649_870;
    uint256 public dilutedShares   = 315_393_000;
    uint256 public netDebtUsd     = 8_244_000_000;

    event ParametersUpdated(uint256 btcHoldings, uint256 dilutedShares, uint256 netDebtUsd);
    event NavUpdated(uint256 navPerShareUsd, uint256 mnavMultiple, uint64 btcPublishTime, uint64 mstrPublishTime);

    constructor(address _pyth) Ownable(msg.sender) {
        pyth = IPyth(_pyth);
    }

    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable {
        pyth.updatePriceFeeds{value: msg.value}(priceUpdateData);
    }

    function getMstrNavAndMnav() external returns (
        uint256 navPerShareUsd,    // 8 decimals
        uint256 mnavMultiple,      // 208 = 2.08×
        uint64 btcPublishTime,
        uint64 mstrPublishTime
    ) {
        PythStructs.Price memory btc  = pyth.getPriceNoOlderThan(BTC_FEED, 600);
        PythStructs.Price memory mstr = pyth.getPriceNoOlderThan(MSTR_FEED, 600);

        int256 btcPriceRaw  = btc.price;
        int256 mstrPriceRaw = mstr.price;
        require(btcPriceRaw > 0 && mstrPriceRaw > 0, "invalid price");

        uint256 btcPrice  = uint256(btcPriceRaw);
        uint256 mstrPrice = uint256(mstrPriceRaw);

        // Assuming expo = -8 for both feeds (true for BTC & MSTR)
        uint256 btcTreasuryValue = btcHoldings * btcPrice; // result has 8 decimals
        uint256 navTotal = btcTreasuryValue > netDebtUsd * 1e8 ? btcTreasuryValue - netDebtUsd * 1e8 : 0;
        navPerShareUsd = navTotal / dilutedShares; // USD per share with 8 decimals

        // Assumptions:
        // - btc.price is int64, we cast to int256 then uint256.
        // - publishTime is uint64.
        
        btcPublishTime  = uint64(btc.publishTime);
        mstrPublishTime = uint64(mstr.publishTime);

        emit NavUpdated(navPerShareUsd, mnavMultiple, btcPublishTime, mstrPublishTime);

        return (navPerShareUsd, mnavMultiple, btcPublishTime, mstrPublishTime);
    }

    function setParameters(uint256 _btcHoldings, uint256 _dilutedShares, uint256 _netDebtUsd) external onlyOwner {
        btcHoldings  = _btcHoldings;
        dilutedShares = _dilutedShares;
        netDebtUsd   = _netDebtUsd;
        emit ParametersUpdated(_btcHoldings, _dilutedShares, _netDebtUsd);
    }
}

