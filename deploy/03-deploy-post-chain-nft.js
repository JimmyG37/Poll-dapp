const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const postChain = await ethers.getContract("PostChain")
    const postChainAddress = postChain.address
    const sunglassesSVG = await fs.readFileSync("./images/sunglasses.svg", { encoding: "utf8" })
    const hatSVG = await fs.readFileSync("./images/hat.svg", { encoding: "utf8" })

    const args = [sunglassesSVG, hatSVG, postChainAddress]
    const postChainNft = await deploy("PostChainNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        log("Verifying...")
        await verify(postChainNft.address, args)
    }
    log("--------------------------------------")
}

module.exports.tags = ["all", "postchainnft"]
