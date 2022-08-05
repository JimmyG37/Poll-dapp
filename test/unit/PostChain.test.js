const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("PostChain Unit Tests", () => {
          let postChain, owner, user1, user2, commentDeadline, likeDeadline, post
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              owner = accounts[0]
              user1 = accounts[1]
              user2 = accounts[2]
              await deployments.fixture(["all"])
              postChain = await ethers.getContract("PostChain")
              let dateInAWeek = new Date() // now
              let dateInAWeek2 = new Date()
              dateInAWeek.setDate(dateInAWeek.getDate() + 2) // add 2 days
              dateInAWeek2.setDate(dateInAWeek2.getDate() + 7) // add 7 days
              commentDeadline = Math.floor(dateInAWeek.getTime() / 1000) // unix timestamp
              likeDeadline = Math.floor(dateInAWeek2.getTime() / 1000)
              post = "Who is the best?"
          })
          describe("createPost", () => {
              it("Reverts when comment deadline or like deadline is too low", async () => {
                  await expect(postChain.createPost(post, 0, likeDeadline)).to.be.revertedWith(
                      "PostChain__AdjustCommentDeadline"
                  )
                  await expect(postChain.createPost(post, commentDeadline, 0)).to.be.revertedWith(
                      "PostChain__AdjustLikeDeadline"
                  )
              })
              it("Emits an event when a Post has been created", async () => {
                  await expect(postChain.createPost(post, commentDeadline, likeDeadline)).to.emit(
                      postChain,
                      "PostCreated"
                  )
              })
              it("Returns a post", async () => {
                  await postChain.createPost(post, commentDeadline, likeDeadline)
                  const blockNum = await ethers.provider.getBlockNumber()
                  const block = await ethers.provider.getBlock(blockNum)
                  const timestamp = block.timestamp
                  const returnedPost = await postChain.getPost(1)
                  assert.equal(returnedPost.creator, owner.address)
                  assert.equal(returnedPost.post, post)
                  assert.equal(returnedPost.postId, 1)
                  assert.equal(returnedPost.dateCreated.toString(), timestamp.toString())
                  assert.equal(returnedPost.commentDeadline, commentDeadline)
                  assert.equal(returnedPost.likeDeadline, likeDeadline)
                  assert.equal(returnedPost.totalComments, 0)
                  assert.equal(returnedPost.totalLikes, 0)
              })
          })

          describe("replyToPost", () => {
              let connectedUser
              beforeEach(async () => {
                  await postChain.createPost(post, commentDeadline, likeDeadline)
                  await postChain.replyToPost(1, "Me, I'm the best")
                  connectedUser = postChain.connect(user1)
              })
              it("Users can submit one comment per Post", async () => {
                  await expect(postChain.replyToPost(1, "Me again")).to.be.revertedWith(
                      "PostChain__OneCommentPerPost"
                  )
              })
              it("Reverts when users submit a comment after comment deadline", async () => {
                  await network.provider.send("evm_increaseTime", [commentDeadline])
                  await network.provider.send("evm_mine")
                  await expect(
                      connectedUser.replyToPost(1, "Am I late to the party?")
                  ).to.be.revertedWith("PostChain__CommentDeadline")
              })
              it("Emits an event when users comment on a post", async () => {
                  await expect(connectedUser.replyToPost(1, "People on time are the best")).to.emit(
                      postChain,
                      "RepliedToPost"
                  )
              })
              it("Returns a comment", async () => {
                  await connectedUser.replyToPost(1, "Dogs")
                  const blockNum = await ethers.provider.getBlockNumber()
                  const block = await ethers.provider.getBlock(blockNum)
                  const timestamp = block.timestamp
                  const selectedComment = await postChain.getComment(2)
                  assert.equal(selectedComment.commenter, connectedUser.signer.address)
                  assert.equal(selectedComment.postId, 1)
                  assert.equal(selectedComment.commentId, 2)
                  assert.equal(selectedComment.comment, "Dogs")
                  assert.equal(selectedComment.timeCreated.toString(), timestamp.toString())
                  assert.equal(selectedComment.likes, 0)
                  assert.equal(selectedComment.hasCommented, 1)
              })
              it("Total amount of comments in a post increases from new comments", async () => {
                  let returnedPost = await postChain.getPost(1)
                  assert.equal(returnedPost.totalComments, 1)
                  await connectedUser.replyToPost(1, "Dogs")
                  returnedPost = await postChain.getPost(1)
                  assert.equal(returnedPost.totalComments, 2)
              })
          })

          describe("likeComment", () => {
              let connectedUser, conntectedUser2
              beforeEach(async () => {
                  await postChain.createPost(post, commentDeadline, likeDeadline)
                  await postChain.replyToPost(1, "You are")
                  connectedUser = postChain.connect(user1)
                  conntectedUser2 = postChain.connect(user2)
              })
              it("Reverts when a user tries to like a comment after like deadline", async () => {
                  await network.provider.send("evm_increaseTime", [likeDeadline])
                  await network.provider.send("evm_mine")
                  await expect(connectedUser.likeComment(1, 1)).to.be.revertedWith(
                      "PostChain__LikeDeadline"
                  )
              })
              it("Users can like one comment per post", async () => {
                  await connectedUser.likeComment(1, 1)
                  await expect(connectedUser.likeComment(1, 1)).to.be.revertedWith(
                      "PostChain__OneLikePerPost"
                  )
              })
              it("Emits an event when a comment is liked", async () => {
                  await expect(connectedUser.likeComment(1, 1)).to.emit(postChain, "CommentLiked")
              })
              it("Returns user like", async () => {
                  await connectedUser.likeComment(1, 1)
                  const selectedLike = await postChain.getUserLike(connectedUser.signer.address, 1)
                  assert.equal(selectedLike.liked, true)
                  assert.equal(selectedLike.postId, 1)
                  assert.equal(selectedLike.commentId, 1)
              })
              it("Like amount of comment and total like amount of post, increases with every new like", async () => {
                  await connectedUser.likeComment(1, 1)
                  let selectedComment = await postChain.getComment(1)
                  let returnedPost = await postChain.getPost(1)
                  assert.equal(selectedComment.likes.toString(), returnedPost.totalLikes.toString())
                  await conntectedUser2.likeComment(1, 1)
                  selectedComment = await postChain.getComment(1)
                  returnedPost = await postChain.getPost(1)
                  assert.equal(selectedComment.likes, 2)
                  assert.equal(returnedPost.totalLikes, 2)
              })
          })

          /* Change verifyCommentToPost function visibility to public to test */
          //   describe("verifyCommentToPost", () => {
          //       it("Verifies if a specific user has commented on a specific post", async () => {
          //           await postChain.createPost(post, commentDeadline, likeDeadline)
          //           await postChain.replyToPost(1, "Bread and butter")
          //           let verify = await postChain.verifyCommentToPost(1, 1)
          //           assert.equal(verify, true)
          //           verify = await postChain.verifyCommentToPost(1, 2)
          //           assert.equal(verify, false)
          //       })
          //   })
      })
