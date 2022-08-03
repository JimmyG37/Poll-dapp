const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("PollChain Unit Tests", () => {
          let pollChain, owner, user1, user2, submitOptionDeadline, voteDeadline, question
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              owner = accounts[0]
              user1 = accounts[1]
              user2 = accounts[2]
              await deployments.fixture(["all"])
              pollChain = await ethers.getContract("PollChain")
              let dateInAWeek = new Date() // now
              let dateInAWeek2 = new Date()
              dateInAWeek.setDate(dateInAWeek.getDate() + 2) // add 2 days
              dateInAWeek2.setDate(dateInAWeek2.getDate() + 7) // add 7 days
              submitOptionDeadline = Math.floor(dateInAWeek.getTime() / 1000) // unix timestamp
              voteDeadline = Math.floor(dateInAWeek2.getTime() / 1000)
              question = "Who is the best?"
          })
          describe("createPoll", () => {
              it("Reverts when submission deadline or vote deadline is too low", async () => {
                  await expect(pollChain.createPoll(question, 0, voteDeadline)).to.be.revertedWith(
                      "PollChain__AdjustSubmissionDeadline"
                  )
                  await expect(
                      pollChain.createPoll(question, submitOptionDeadline, 0)
                  ).to.be.revertedWith("PollChain__AdjustVoteDeadline")
              })
              it("Emits an event when a Poll has been created", async () => {
                  await expect(
                      pollChain.createPoll(question, submitOptionDeadline, voteDeadline)
                  ).to.emit(pollChain, "PollCreated")
              })
          })

          describe("submitPollOption", () => {
              let connectedUser
              beforeEach(async () => {
                  await pollChain.createPoll(question, submitOptionDeadline, voteDeadline)
                  await pollChain.submitPollOption(1, "Me, I'm the best")
                  connectedUser = pollChain.connect(user1)
              })
              it("Users can only submit one option per Poll", async () => {
                  await expect(pollChain.submitPollOption(1, "Me again")).to.be.revertedWith(
                      "PollChain__OneSubmissionPerPoll"
                  )
              })
              it("Reverts when users submit a poll option after deadline", async () => {
                  await network.provider.send("evm_increaseTime", [submitOptionDeadline])
                  await network.provider.send("evm_mine")
                  await expect(
                      connectedUser.submitPollOption(1, "Am I late to the party?")
                  ).to.be.revertedWith("PollChain__OptionSubmissionOver")
              })
              it("Emits an event when a poll option is submitted", async () => {
                  await expect(
                      connectedUser.submitPollOption(1, "People on time are the best")
                  ).to.emit(pollChain, "PollOptionSubmitted")
              })
          })

          describe("vote", () => {
              let connectedUser
              beforeEach(async () => {
                  await pollChain.createPoll(question, submitOptionDeadline, voteDeadline)
                  await pollChain.submitPollOption(1, "You are")
                  connectedUser = pollChain.connect(user1)
              })
              it("Reverts when a user tries to vote after vote deadline", async () => {
                  await network.provider.send("evm_increaseTime", [voteDeadline])
                  await network.provider.send("evm_mine")
                  await expect(connectedUser.vote(1, 1)).to.be.revertedWith("PollChain__VoteOver")
              })
              it("Reverts when invalid option is selected", async () => {
                  await expect(connectedUser.vote(1, 0)).to.be.revertedWith(
                      "PollChain__NotValidOption"
                  )
              })
              it("User should only be able to vote once per poll", async () => {
                  await connectedUser.vote(1, 1)
                  await expect(connectedUser.vote(1, 1)).to.be.revertedWith(
                      "PollChain__AlreadyVoted"
                  )
              })
              it("Emits an event for vote success", async () => {
                  await expect(connectedUser.vote(1, 1)).to.emit(pollChain, "VoteSuccess")
              })
          })
      })
