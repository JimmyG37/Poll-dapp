const { ethers, network } = require("hardhat")

async function replyToPost() {
    const postChain = await ethers.getContract("PostChain")
    const replyTx = await postChain.replyToPost(1, "Howdy")
    const replyTxReceipt = await replyTx.wait(1)
    const postId = replyTxReceipt.events[0].args.postId
    const commentId = replyTxReceipt.events[0].args.commentId
    const post = await postChain.getPost(postId)
    console.log(post)
    console.log(`Replied to post: ${post.post}`)
    console.log(`CommentId: ${commentId.toString()}`)
}

replyToPost()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
