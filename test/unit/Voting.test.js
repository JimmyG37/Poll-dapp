const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Voting Unit Tests", () => {
          let voting, owner, user1, user2
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              owner = accounts[0]
              user1 = accounts[1]
              user2 = accounts[2]
              await deployments.fixture(["all"])
              voting = await ethers.getContract("Voting")
          })
          describe("createElection", () => {
              let dateInAWeek = new Date() // now
              let dateInAWeek2 = new Date()
              dateInAWeek.setDate(dateInAWeek.getDate() + 2) // add 2 days
              dateInAWeek2.setDate(dateInAWeek.getDate() + 7)
              const deadline = Math.floor(dateInAWeek.getTime() / 1000) // unix timestamp
              const deadline2 = Math.floor(dateInAWeek.getTime() / 1000)
              let title = "Who is the best?"
              it("Reverts when regristration or voting period is too low", async () => {
                  await expect(voting.createElection(title, 0, deadline2)).to.be.revertedWith(
                      "Voting__AdjustRegistrationPeriod"
                  )
                  await expect(voting.createElection(title, deadline, 0)).to.be.revertedWith(
                      "Voting__AdjustVotingPeriod"
                  )
              })
              it("Returns the election when the election id is provided", async () => {
                  await voting.createElection(title, deadline, deadline2)
                  const election = await voting.getElection(1)
                  assert(election.title == title)
                  assert(election.registrationPeriod.toString() == deadline.toString())
                  assert(election.votingPeriod.toString() == deadline2.toString())
                  assert(election.registrationState == 0)
                  assert(election.voteState == 0)
              })
              it("Emits an event when election has been created", async () => {
                  await expect(voting.createElection(title, deadline, deadline2)).to.emit(
                      voting,
                      "ElectionCreated"
                  )
              })
          })
      })
