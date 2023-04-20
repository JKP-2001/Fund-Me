const { getNamedAccounts, ethers } = require("hardhat")

const main = async()=>{
    const {deployer} = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log(`Got contract FundMe at ${fundMe.address}`)
    console.log("funding......");
    await fundMe.fund({value:ethers.utils.parseEther("0.1")});
    console.log("funding done.");
}

main().catch(err=>{
    console.log({error:err.toString()})
})


