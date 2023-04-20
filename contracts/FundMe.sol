//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./RateConversion.sol";

error FundMe__NotOwner();

contract FundMe{

    using RateConvertor for uint256;
    
    uint constant minUSD  = 10 * 10 ** 18;   // minimum of 10 USD
    address private immutable i_owner;

    address[] private s_funders;

    address private s_priceFeed;

    mapping(address=>uint) private s_addressToAmount;

    constructor(address priceFeedAddress){
        i_owner = msg.sender;
        s_priceFeed = priceFeedAddress;
    }

    modifier onlyOwner() {
        // require(msg.sender == i_owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    modifier notOwner(){
        if(msg.sender!=i_owner) revert FundMe__NotOwner();
        _;
    }

    function getAmountFromAddress(address amountAddress) public view returns(uint256){
        return(s_addressToAmount[amountAddress]);
    }

    uint256 public amount;

    function fund() public payable {
        // uint256 eth = (getPrice()*msg.value)/1e18;
        // amount = eth;
        
        require(msg.value.convertRate(s_priceFeed)>=minUSD,"More Eth required");
        s_funders.push(msg.sender);
        s_addressToAmount[msg.sender] += msg.value;
    }

    

    function cheaperWithdraw() public onlyOwner {
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
        address[] memory Funders = s_funders;
        uint256 len = Funders.length;
        // mappings can't be in memory, sorry!
        for (
            uint256 funderIndex = 0;
            funderIndex < len;
            funderIndex++
        ) {
            address funder = Funders[funderIndex];
            s_addressToAmount[funder] = 0;
        }
        Funders = new address[](0);
    }

    function getPriceFeed() public view returns(AggregatorV3Interface){
        return AggregatorV3Interface(s_priceFeed);
    }

    
    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view  returns (address) {
        return i_owner;
    }
    
    receive() external payable{
        fund();
    }

    fallback() external payable{
        fund();
    }

}