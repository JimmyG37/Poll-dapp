const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const postChain = await ethers.getContract("PostChain")
    const postChainAddress = postChain.address
    const smileSVG = await fs.readFileSync("./images/smile.svg", { encoding: "utf8" })
    const glassesSVG = await fs.readFileSync("./images/glasses.svg", { encoding: "utf8" })
    const sunglassesSVG = await fs.readFileSync("./images/sunglasses.svg", { encoding: "utf8" })
    const args = [smileSVG, glassesSVG, sunglassesSVG, postChainAddress]
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
