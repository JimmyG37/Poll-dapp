const { ethers, network } = require("hardhat")

async function likeComment() {
    const postChain = await ethers.getContract("PostChain")
    const likeTx = await postChain.likeComment(1, 1)
    const likeTxReceipt = await likeTx.wait()
    const user = likeTxReceipt.events[0].args.user
    const postId = likeTxReceipt.events[0].args.postId
    const commentId = likeTxReceipt.events[0].args.commentId
    const post = await postChain.getPost(postId)
    const comment = await postChain.getComment(commentId)
    console.log(`${user} liked this comment "${comment.comment}", from this post "${post.post}"`)
    console.log(post.totalLikes.toString())
    console.log(comment.likes.toString())
}

likeComment()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
