const { ethers, network } = require("hardhat")

async function createPost() {
    let dateInAWeek = new Date()
    dateInAWeek.setDate(dateInAWeek.getDate() + 7)
    let deadline = Math.floor(dateInAWeek.getTime() / 1000)
    const postChain = await ethers.getContract("PostChain")
    const postChainTx = await postChain.createPost("Hello World", deadline)
    const postChainTxReceipt = await postChainTx.wait(1)
    const postId = postChainTxReceipt.events[0].args.postId
    console.log(`Post created! ${postId.toString()}`)
}

createPost()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
