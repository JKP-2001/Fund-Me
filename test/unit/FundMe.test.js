const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");

describe('FundMe Test', async () => {
    let fundMe
    let mockV3Aggregator
    let deployer

    const VALUE = ethers.utils.parseEther("1");

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer)
        // console.log({ fundMe });
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator", deployer
        )
    })



    describe("constructor", async () => {
        it("set the price feed address.", async () => {
            // console.log({fundMe})
            const response = await fundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.address);
        })
    })

    describe("fund", async () => {
        it("Fails if you don't send enough ETH", async () => {
            expect(fundMe.fund());
        })

        it("Updates the amount funded data structure", async () => {
            await fundMe.fund({ value: VALUE });
            const response = await fundMe.getAmountFromAddress(
                deployer
            )
            assert.equal(response.toString(), VALUE.toString());
        })

        it("Adds funder to array of funder", async () => {
            await fundMe.fund({ value: VALUE });
            const response = await fundMe.getFunder(0);
            assert.equal(response, deployer);
        })
    })


    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: VALUE });
        })

        it("withdraw ETH from a single founder", async () => {
            //Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);

            const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

            //Act
            const transaction = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transaction.wait(1);

            const { effectiveGasPrice, gasUsed } = transactionReceipt;

            const gasCost = effectiveGasPrice.mul(gasUsed);

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);

            const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

            //Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());
        })


        it("withdraw ETH from a multiple founder", async () => {
            //Arrange
            const accounts = await ethers.getSigners();
            // console.log({accounts})
            // accounts.map(async (address) => {
            //     const fundMeConnectContract = await fundMe.connect(address);
            //     await fundMeConnectContract.fund({ value: VALUE });
            // })

            for (let i = 0; i < 6; i++) {
                const fundMeConnectContract = await fundMe.connect(accounts[i]);
                await fundMeConnectContract.fund({ value: VALUE });
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);

            console.log({ startingFundMeBalance: startingFundMeBalance.toString() });

            const startingDeployerBalance = await fundMe.provider.getBalance(deployer);
            console.log({ startingDeployerBalance: startingDeployerBalance.toString() });

            //Act
            const transaction = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transaction.wait();

            const { effectiveGasPrice, gasUsed } = transactionReceipt;

            const gasCost = effectiveGasPrice.mul(gasUsed);

            console.log({ gasCost: gasCost.toString() });

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);

            console.log({ endingFundMeBalance: endingFundMeBalance.toString() });

            const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
            console.log({ endingDeployerBalance: endingDeployerBalance.toString() });

            //Assert
            // accounts.map(async (address) => {
            //     assert.equal(
            //         await fundMe.getAmountFromAddress(
            //             address
            //         ),
            //         0
            //     )
            // })

            

            assert.equal(endingFundMeBalance, 0);
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());

            // await expect(fundMe.getFunder(0)).to.be.reverted;
            for (let i = 0; i < 6; i++) {
                assert.equal(
                    await fundMe.getAmountFromAddress(
                        accounts[i].address
                    ),
                    0
                )
            }
        })

        it("only owner can withdraw",async ()=>{
            const accounts = await ethers.getSigners();
            const fundMeConnectedContract = await fundMe.connect(
                accounts[1]
            )
            await expect(
                fundMeConnectedContract.cheaperWithdraw()
            ).to.be.revertedWithCustomError(fundMe,"FundMe__NotOwner")
        })
    })

})