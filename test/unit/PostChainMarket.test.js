const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("PostChainMarket Unit Tests", () => {
          let postChainMarket, postChainNft, postChain, deployer, player, player2, deadline
          const PRICE = ethers.utils.parseEther("0.1")
          const TOKEN_ID = 1
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              player = accounts[1]
              player2 = accounts[2]
              await deployments.fixture(["all"])
              postChain = await ethers.getContract("PostChain")
              postChainNft = await ethers.getContract("PostChainNft")
              postChainMarket = await ethers.getContract("PostChainMarket")
              let dateInAWeek = new Date() // now
              dateInAWeek.setDate(dateInAWeek.getDate() + 7) // add 7 days
              deadline = Math.floor(dateInAWeek.getTime() / 1000) // unix timestamp
              await postChain.createPost("Hello World", deadline)
              await network.provider.send("evm_increaseTime", [deadline])
              await network.provider.send("evm_mine")
              await postChainNft.mintNft(1)
              await postChainNft.approve(postChainMarket.address, TOKEN_ID)
          })

          describe("listItem", () => {
              it("reverts if Nft is already listed", async () => {
                  await postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  await expect(
                      postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("AlreadyListed")
              })
              it("reverts if price is below or equal to 0", async () => {
                  await expect(
                      postChainMarket.listItem(postChainNft.address, TOKEN_ID, 0)
                  ).to.be.revertedWith("PriceMustBeAboveZero")
              })
              it("exclusively allows owners to list", async () => {
                  postChainMarketPlayer = postChainMarket.connect(player)
                  await postChainNft.approve(player.address, TOKEN_ID)
                  await expect(
                      postChainMarketPlayer.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NotOwner")
              })
              it("needs approvals to list item", async () => {
                  await postChainNft.approve(ethers.constants.AddressZero, TOKEN_ID)
                  await expect(
                      postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("PostChainMarket__NotApprovedForMarketPlace()")
              })
              it("successfully emits an event after Nft has been listed", async () => {
                  await expect(postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE))
                      .to.emit(postChainMarket, "ItemListed")
                      .withArgs(deployer.address, postChainNft.address, TOKEN_ID, PRICE)
              })
              it("Updates listing with seller and price", async () => {
                  await postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  const listing = await postChainMarket.getListing(postChainNft.address, TOKEN_ID)
                  assert(listing.price.toString() == PRICE.toString())
                  assert(listing.seller.toString() == deployer.address)
              })
          })

          describe("buyItem", () => {
              let playerConnected, player2Connected
              beforeEach(async () => {
                  await postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  playerConnected = postChainMarket.connect(player)
                  player2Connected = postChainMarket.connect(player2)
              })
              it("reverts if buying price is not met", async () => {
                  await expect(
                      playerConnected.buyItem(postChainNft.address, TOKEN_ID, {
                          value: 0,
                      })
                  ).to.be.revertedWith("PriceNotMet")
              })
              it("Proceeds go to seller after Nft is bought", async () => {
                  await playerConnected.buyItem(postChainNft.address, TOKEN_ID, {
                      value: PRICE,
                  })
                  const deployerProceeds = await postChainMarket.getProceeds(deployer.address)
                  assert(deployerProceeds.toString() == PRICE.toString())
              })
              it("Transfers ownership of nft to buyer after purchase", async () => {
                  await playerConnected.buyItem(postChainNft.address, TOKEN_ID, {
                      value: PRICE,
                  })
                  const newOwner = await postChainNft.ownerOf(TOKEN_ID)
                  assert(newOwner.toString() == player.address)
              })
              it("Nft creator gets royalties when nft is resold", async () => {
                  await playerConnected.buyItem(postChainNft.address, TOKEN_ID, {
                      value: PRICE,
                  })
                  playerConnected = postChainNft.connect(player)
                  await playerConnected.approve(postChainMarket.address, TOKEN_ID)
                  playerConnected = postChainMarket.connect(player)
                  await playerConnected.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  await player2Connected.buyItem(postChainNft.address, TOKEN_ID, {
                      value: PRICE,
                  })
                  const PostRoyaltyInfo = await postChainNft.royaltyInfo(TOKEN_ID, PRICE)
                  const sellerProceeds = await postChainMarket.getProceeds(player.address)
                  const sellerShare = PRICE - PostRoyaltyInfo[1]
                  const creatorRoyalties = await postChainMarket.getRoyalties(deployer.address)
                  assert.equal(sellerProceeds.toString(), sellerShare.toString())
                  assert.equal(PostRoyaltyInfo[0], deployer.address)
                  assert.equal(creatorRoyalties.toString(), PostRoyaltyInfo[1].toString())
              })
              it("Emits an event after purchase", async () => {
                  await expect(
                      playerConnected.buyItem(postChainNft.address, TOKEN_ID, {
                          value: PRICE,
                      })
                  )
                      .to.emit(postChainMarket, "ItemBought")
                      .withArgs(player.address, postChainNft.address, TOKEN_ID, PRICE)
              })
              it("Removes listing after purchase", async () => {
                  await playerConnected.buyItem(postChainNft.address, TOKEN_ID, {
                      value: PRICE,
                  })
                  const listing = await postChainMarket.getListing(postChainNft.address, TOKEN_ID)
                  assert(listing.price.toString() == "0")
              })
          })

          describe("cancelItem", () => {
              it("reverts if there is no listing", async () => {
                  const error = `NotListed("${postChainNft.address}", ${TOKEN_ID})`
                  await expect(
                      postChainMarket.cancelItem(postChainNft.address, TOKEN_ID)
                  ).to.be.revertedWith(error)
              })
              it("reverts of anyone but the owner tries to call", async () => {
                  await postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  postChainMarket = postChainMarket.connect(player)
                  await postChainNft.approve(player.address, TOKEN_ID)
                  await expect(
                      postChainMarket.cancelItem(postChainNft.address, TOKEN_ID)
                  ).to.be.revertedWith("NotOwner")
              })
              it("emits an event and removes listing", async () => {
                  await postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  expect(await postChainMarket.cancelItem(postChainNft.address, TOKEN_ID)).to.emit(
                      "ItemCanceled"
                  )
                  const listing = await postChainMarket.getListing(postChainNft.address, TOKEN_ID)
                  assert(listing.price.toString() == "0")
              })
          })

          describe("updateListing", () => {
              it("must be owner and listed", async () => {
                  await expect(
                      postChainMarket.updateListing(postChainNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NotListed")
                  await postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  postChainMarket = postChainMarket.connect(player)
                  await expect(
                      postChainMarket.updateListing(postChainNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NotOwner")
              })
              it("updates the price of the item", async () => {
                  const updatedPrice = ethers.utils.parseEther("0.2")
                  await postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  expect(
                      await postChainMarket.updateListing(
                          postChainNft.address,
                          TOKEN_ID,
                          updatedPrice
                      )
                  ).to.emit("ItemListed")
                  const listing = await postChainMarket.getListing(postChainNft.address, TOKEN_ID)
                  assert(listing.price.toString() == updatedPrice.toString())
              })
          })

          describe("withdrawProceeds", () => {
              it("does not allow 0 proceed withdrawls", async () => {
                  await expect(postChainMarket.withdrawProceeds()).to.be.revertedWith("NoProceeds")
              })
              it("withdraws proceeds", async () => {
                  await postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  const playerConnectedPostChainMarket = postChainMarket.connect(player)
                  await playerConnectedPostChainMarket.buyItem(postChainNft.address, TOKEN_ID, {
                      value: PRICE,
                  })

                  const deployerProceedsBefore = await postChainMarket.getProceeds(deployer.address)
                  const deployerBalanceBefore = await deployer.getBalance()
                  const txReponse = await postChainMarket.withdrawProceeds()
                  const transactionReceipt = await txReponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const deployerBalanceAfter = await deployer.getBalance()

                  assert(
                      deployerBalanceAfter.add(gasCost).toString() ==
                          deployerProceedsBefore.add(deployerBalanceBefore).toString()
                  )
              })
          })

          describe("withdrawRoyalties", () => {
              it("does not allow 0 proceed withdrawls", async () => {
                  await expect(postChainMarket.withdrawRoyalties()).to.be.revertedWith(
                      "NoRoyalties"
                  )
              })
              it("withdraws royalties", async () => {
                  await postChainMarket.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  let playerConnected = postChainMarket.connect(player)
                  const player2Connected = postChainMarket.connect(player2)
                  await playerConnected.buyItem(postChainNft.address, TOKEN_ID, {
                      value: PRICE,
                  })
                  playerConnected = postChainNft.connect(player)
                  await playerConnected.approve(postChainMarket.address, TOKEN_ID)
                  playerConnected = postChainMarket.connect(player)
                  await playerConnected.listItem(postChainNft.address, TOKEN_ID, PRICE)
                  await player2Connected.buyItem(postChainNft.address, TOKEN_ID, {
                      value: PRICE,
                  })

                  const deployerRoyaltiesBefore = await postChainMarket.getRoyalties(
                      deployer.address
                  )
                  const deployerBalanceBefore = await deployer.getBalance()
                  const txReponse = await postChainMarket.withdrawRoyalties()
                  const transactionReceipt = await txReponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const deployerBalanceAfter = await deployer.getBalance()

                  assert(
                      deployerBalanceAfter.add(gasCost).toString() ==
                          deployerRoyaltiesBefore.add(deployerBalanceBefore).toString()
                  )
              })
          })
      })
