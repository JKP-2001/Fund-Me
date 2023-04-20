const { getNamedAccounts, ethers } = require("hardhat");

const main = async()=>{
    const {deployer} = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe",deployer);
    console.log("Withdrawing.....");
    const transactionResponse = await fundMe.cheaperWithdraw();
    const transactionReceipt = await transactionResponse.wait(1);
    console.log("Withdrawing done");

}


main().catch(err=>{
    console.log({err:err.toString()});
})