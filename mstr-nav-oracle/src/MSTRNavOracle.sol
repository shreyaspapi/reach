// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IPyth} from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import {PythStructs} from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MSTRNavOracle is Ownable {
    IPyth public immutable pyth;

    bytes32 public constant BTC_FEED  = 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43;
    bytes32 public constant MSTR_FEED = 0xe1e80251e5f5184f2195008382538e847fafc36f751896889dd3d1b1f6111f09; // Live Equity.MSTR.US

    uint256 public btcHoldings    = 649_870;
    uint256 public dilutedShares   = 315_393_000;
    uint256 public netDebtUsd     = 8_244_000_000;

    event ParametersFetchedFromApi(uint256 btcHoldings, uint256 dilutedShares, uint256 netDebtUsd, string source);
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
        // Allow up to 1 week (604800s) of staleness for weekend demos
        PythStructs.Price memory btc  = pyth.getPriceNoOlderThan(BTC_FEED, 604800);
        PythStructs.Price memory mstr = pyth.getPriceNoOlderThan(MSTR_FEED, 604800);

        int256 btcPriceRaw  = btc.price;
        int256 mstrPriceRaw = mstr.price;
        require(btcPriceRaw > 0 && mstrPriceRaw > 0, "invalid price");

        uint256 btcPrice  = uint256(btcPriceRaw);
        uint256 mstrPrice = uint256(mstrPriceRaw);

        // Assuming expo = -8 for both feeds (true for BTC & MSTR)
        uint256 btcTreasuryValue = btcHoldings * btcPrice; // result has 8 decimals
        uint256 navTotal = btcTreasuryValue > netDebtUsd * 1e8 ? btcTreasuryValue - netDebtUsd * 1e8 : 0;
        navPerShareUsd = navTotal / dilutedShares; // USD per share with 8 decimals

        if (navPerShareUsd > 0) {
            mnavMultiple = (mstrPrice * 100) / navPerShareUsd; // 2 decimals (e.g. 208 = 2.08x)
        }

        // Assumptions:
        // - btc.price is int64, we cast to int256 then uint256.
        // - publishTime is uint64.
        
        btcPublishTime  = uint64(btc.publishTime);
        mstrPublishTime = uint64(mstr.publishTime);

        emit NavUpdated(navPerShareUsd, mnavMultiple, btcPublishTime, mstrPublishTime);

        return (navPerShareUsd, mnavMultiple, btcPublishTime, mstrPublishTime);
    }

    function setParameters(uint256 _btcHoldings, uint256 _dilutedShares, uint256 _netDebtUsd, string calldata _source) external onlyOwner {  // Or use roles for relayer
        // Optional: Sanity check (e.g., BTC can't drop >10k overnight)
        require(_btcHoldings >= btcHoldings * 95 / 100 && _btcHoldings <= btcHoldings * 200 / 100, "Invalid BTC delta");
        require(_dilutedShares >= dilutedShares * 90 / 100, "Invalid shares drop");
        
        btcHoldings = _btcHoldings;
        dilutedShares = _dilutedShares;
        netDebtUsd = _netDebtUsd;
        emit ParametersFetchedFromApi(_btcHoldings, _dilutedShares, _netDebtUsd, _source);
    }
}

