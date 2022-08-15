const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("PostChain Unit Tests", () => {
          let postChain, owner, user1, user2, deadline, post, tip
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              owner = accounts[0]
              user1 = accounts[1]
              user2 = accounts[2]
              await deployments.fixture(["all"])
              postChain = await ethers.getContract("PostChain")
              let dateInAWeek = new Date() // now
              dateInAWeek.setDate(dateInAWeek.getDate() + 7) // add 7 days
              deadline = Math.floor(dateInAWeek.getTime() / 1000) // unix timestamp
              post = "Who is the best?"
              tip = ethers.utils.parseEther("0.001")
          })
          describe("createPost", () => {
              it("Reverts when set deadline is too low", async () => {
                  await expect(postChain.createPost(post, 0)).to.be.revertedWith(
                      "PostChain__AdjustDeadline"
                  )
              })
              it("Emits an event when a Post has been created", async () => {
                  await expect(postChain.createPost(post, deadline)).to.emit(
                      postChain,
                      "PostCreated"
                  )
              })
              it("Returns a post", async () => {
                  await postChain.createPost(post, deadline)
                  const blockNum = await ethers.provider.getBlockNumber()
                  const block = await ethers.provider.getBlock(blockNum)
                  const timestamp = block.timestamp
                  const returnedPost = await postChain.getPost(1)
                  assert.equal(returnedPost.creator, owner.address)
                  assert.equal(returnedPost.post, post)
                  assert.equal(returnedPost.postId, 1)
                  assert.equal(returnedPost.dateCreated.toString(), timestamp.toString())
                  assert.equal(returnedPost.likeAndCommentDeadline, deadline)
                  assert.equal(returnedPost.totalComments, 0)
                  assert.equal(returnedPost.totalLikes, 0)
              })
          })

          describe("replyToPost", () => {
              let connectedUser
              beforeEach(async () => {
                  await postChain.createPost(post, deadline)
                  await postChain.replyToPost(1, "Me, I'm the best")
                  connectedUser = postChain.connect(user1)
              })
              it("Reverts when users submit a comment after deadline", async () => {
                  await network.provider.send("evm_increaseTime", [deadline])
                  await network.provider.send("evm_mine")
                  await expect(
                      connectedUser.replyToPost(1, "Am I late to the party?")
                  ).to.be.revertedWith("PostChain__Deadline")
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
                  await postChain.createPost(post, deadline)
                  await postChain.replyToPost(1, "You are")
                  connectedUser = postChain.connect(user1)
                  conntectedUser2 = postChain.connect(user2)
              })
              it("Reverts when a user tries to like a comment after deadline", async () => {
                  await network.provider.send("evm_increaseTime", [deadline])
                  await network.provider.send("evm_mine")
                  await expect(connectedUser.likeComment(1, 1)).to.be.revertedWith(
                      "PostChain__Deadline"
                  )
              })
              it("Users can't like the same comment more than once", async () => {
                  await connectedUser.likeComment(1, 1)
                  await expect(connectedUser.likeComment(1, 1)).to.be.revertedWith(
                      "PostChain__AlreadyLiked"
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

          describe("Tip and Withdraw", () => {
              let connectedUser, conntectedUser2, updatedTipAmount
              beforeEach(async () => {
                  await postChain.createPost(post, deadline)
                  connectedUser = postChain.connect(user1)
                  conntectedUser2 = postChain.connect(user2)
                  connectedUser.replyToPost(1, "You are")
                  updatedTipAmount = ethers.utils.parseEther("1")
              })
              it("Reverts when tip amount is too low", async () => {
                  await expect(
                      connectedUser.tipUser(owner.address, { value: 0 })
                  ).to.be.revertedWith("PostChain__TipAmountNotMet")
              })
              it("Tips a post and a comment", async () => {
                  await connectedUser.tipUser(owner.address, { value: tip })
                  await conntectedUser2.tipUser(connectedUser.signer.address, { value: tip })
                  const postCreatorBalance = await postChain.getProceeds(owner.address)
                  const commenterBalace = await connectedUser.getProceeds(
                      connectedUser.signer.address
                  )
                  assert.equal(postCreatorBalance.toString(), tip.toString())
                  assert.equal(commenterBalace.toString(), tip.toString())
              })
              it("Emits an event when a user tips", async () => {
                  await expect(connectedUser.tipUser(owner.address, { value: tip })).to.emit(
                      postChain,
                      "UserTipped"
                  )
              })
              it("Reverts when a user tries to withdraw an empty balance", async () => {
                  await expect(connectedUser.withdrawBalances()).to.be.revertedWith(
                      "PostChain__EmptyBalance"
                  )
              })
              it("Withdraws user balance", async () => {
                  await connectedUser.tipUser(owner.address, { value: tip })
                  const ownerProceeds = await postChain.getProceeds(owner.address)
                  const ownerBalanceBefore = await owner.getBalance()
                  const txReponse = await postChain.withdrawBalances()
                  const txReceipt = await txReponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const ownerBalanceAfter = await owner.getBalance()
                  assert(
                      ownerBalanceAfter.add(gasCost).toString() ==
                          ownerProceeds.add(ownerBalanceBefore).toString()
                  )
              })
              it("Only owner can update tip amount", async () => {
                  await expect(
                      conntectedUser2.updateTipAmount(updatedTipAmount)
                  ).to.be.revertedWith("PostChain__YouAreNotTheOwner")

                  await postChain.updateTipAmount(updatedTipAmount)
                  const newTipAmount = await postChain.getTipAmount()
                  assert.equal(newTipAmount.toString(), updatedTipAmount.toString())
              })
          })

          describe("verifyCommentToPost", () => {
              it("Verifies if a specific user has commented on a specific post", async () => {
                  await postChain.createPost(post, deadline)
                  await postChain.replyToPost(1, "Bread and butter")
                  let verify = await postChain.verifyCommentToPost(1, 1)
                  assert.equal(verify, true)
                  verify = await postChain.verifyCommentToPost(1, 2)
                  assert.equal(verify, false)
              })
          })
      })
