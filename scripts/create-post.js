const { ethers, network } = require("hardhat")

async function createPost() {
    let dateInAWeek = new Date() // now
    let dateInAWeek2 = new Date()
    dateInAWeek.setDate(dateInAWeek.getDate() + 1) // add 1 days
    dateInAWeek2.setDate(dateInAWeek2.getDate() + 2) // add 2 days
    let commentDeadline = Math.floor(dateInAWeek.getTime() / 1000) // unix timestamp
    let likeDeadline = Math.floor(dateInAWeek2.getTime() / 1000)
    const postChain = await ethers.getContract("PostChain")
    const postChainTx = await postChain.createPost("Hello World", commentDeadline, likeDeadline)
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
