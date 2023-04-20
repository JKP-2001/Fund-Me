const { network, run } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../Utils/Verify");
require("dotenv").config()


module.exports = async function deployFunc({getNamedAccounts, deployments}){
    // const {getNamedAccounts, deployments} = hre;cl
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress
    // console.log({netName:network.name});
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    const fundMe = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer, 
        args: [ethUsdPriceFeedAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        // waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if(!developmentChains.includes(network.name) && process.env.ETHER_API_KEY){
        await verify(fundMe.address,[ethUsdPriceFeedAddress]);
    }
}


module.exports.tags = ["all", "fund-me"]