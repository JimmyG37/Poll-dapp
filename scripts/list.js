const { ethers, network } = require("hardhat")

const PRICE = ethers.utils.parseEther("0.5")

async function list() {
    const postChainMarket = await ethers.getContract("PostChainMarket")
    const postChainNft = await ethers.getContract("PostChainNft")
    console.log("Approving Nft...")
    const approvalTx = await postChainNft.approve(postChainMarket.address, 1)
    await approvalTx.wait(1)
    console.log("Listing Nft...")
    const tx = await postChainMarket.listItem(postChainNft.address, 1, PRICE)
    await tx.wait(1)
    console.log("Listed!")
}

list()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
