//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library RateConvertor{

    function getPrice(address priceFeedAddress) internal view returns (uint256) {
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        
        return uint256(answer * 10000000000);
    }

    function convertRate(uint256 eth, address priceFeedAddress) internal view returns(uint256){
        uint256 ethToUSD = (eth*getPrice(priceFeedAddress))/1e18;
        return uint256(ethToUSD);
    }
}