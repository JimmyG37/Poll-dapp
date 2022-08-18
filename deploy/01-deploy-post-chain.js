const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const smileSVG = await fs.readFileSync("./images/smile.svg", { encoding: "utf8" })
    const glassesSVG = await fs.readFileSync("./images/glasses.svg", { encoding: "utf8" })
    const sunglassesSVG = await fs.readFileSync("./images/sunglasses.svg", { encoding: "utf8" })
    const args = [smileSVG, glassesSVG, sunglassesSVG]
    const postChain = await deploy("PostChain", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(postChain.address, args)
    }
    log("--------------------------------------")
}

module.exports.tags = ["all", "postChain"]
