// require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
//require("@nomiclabs/hardhat-ethers")
require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")



/** @type import('hardhat/config').HardhatUserConfig */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ETHER_API_KEY = process.env.ETHER_API_KEY;


module.exports = {
  solidity: {
    compilers: [{ version: "0.8.18" }, { version: "0.6.6" }]
  },

  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },

  etherscan: {
    apiKey: {
      sepolia: ETHER_API_KEY
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
},
};
