const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Voting Unit Tests", () => {
          let voting, owner, user1, user2, registrationPeriod, votingPeriod, title
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              owner = accounts[0]
              user1 = accounts[1]
              user2 = accounts[2]
              await deployments.fixture(["all"])
              voting = await ethers.getContract("Voting")
              let dateInAWeek = new Date() // now
              let dateInAWeek2 = new Date()
              dateInAWeek.setDate(dateInAWeek.getDate() + 2) // add 2 days
              dateInAWeek2.setDate(dateInAWeek.getDate() + 7) // add 7 days
              registrationPeriod = Math.floor(dateInAWeek.getTime() / 1000) // unix timestamp
              votingPeriod = Math.floor(dateInAWeek.getTime() / 1000)
              title = "Who is the best?"
          })
          describe("createElection", () => {
              it("Reverts when regristration or voting period is too low", async () => {
                  await expect(voting.createElection(title, 0, votingPeriod)).to.be.revertedWith(
                      "Voting__AdjustRegistrationPeriod"
                  )
                  await expect(
                      voting.createElection(title, registrationPeriod, 0)
                  ).to.be.revertedWith("Voting__AdjustVotingPeriod")
              })
              it("Returns the election when the election id is provided", async () => {
                  await voting.createElection(title, registrationPeriod, votingPeriod)
                  const election = await voting.getElection(1)
                  assert(election.title == title)
                  assert(election.registrationPeriod.toString() == registrationPeriod.toString())
                  assert(election.votingPeriod.toString() == votingPeriod.toString())
              })
              it("Emits an event when election has been created", async () => {
                  await expect(
                      voting.createElection(title, registrationPeriod, votingPeriod)
                  ).to.emit(voting, "ElectionCreated")
              })
          })

          describe("candidateRegistration", () => {
              let connectedUser
              beforeEach(async () => {
                  await voting.createElection(title, registrationPeriod, votingPeriod)
                  await voting.candidateRegistration(1, "Alice")
                  connectedUser = voting.connect(user1)
              })
              it("Reverts if a candidate is already registered for current election", async () => {
                  await expect(voting.candidateRegistration(1, "Alice")).to.be.revertedWith(
                      "Voting__AlreadyRegistered"
                  )
              })
              it("Reverts if a candidate tries to register after registration period", async () => {
                  await network.provider.send("evm_increaseTime", [registrationPeriod])
                  await network.provider.send("evm_mine")
                  await expect(connectedUser.candidateRegistration(1, "Bob")).to.be.revertedWith(
                      "Voting__RegistrationPeriodOver"
                  )
              })
              it("Emits an event if a candidate successfully registered", async () => {
                  await expect(connectedUser.candidateRegistration(1, "Bob")).to.emit(
                      voting,
                      "CandidateResgistered"
                  )
              })
              it("Returns a registered candidate", async () => {
                  const Alice = await voting.getCandidate(owner.address, 1)
                  assert.equal(Alice.name, "Alice")
                  assert.equal(Alice.isRegistered, 1)
                  assert.equal(Alice.voteCount, 0)
              })
          })

          describe("vote", () => {
              let connectedUser
              beforeEach(async () => {
                  await voting.createElection(title, registrationPeriod, votingPeriod)
                  await voting.candidateRegistration(1, "Alice")
                  connectedUser = voting.connect(user1)
              })
              it("Reverts when a user tries to vote after voting period", async () => {
                  await network.provider.send("evm_increaseTime", [votingPeriod])
                  await network.provider.send("evm_mine")
                  await expect(connectedUser.vote(1, owner.address)).to.be.revertedWith(
                      "Voting__VotePeriodOver"
                  )
              })
              it("Reverts if picked candidate is not registered", async () => {
                  await expect(connectedUser.vote(1, user1.address)).to.be.revertedWith(
                      "Voting__CandidateNotRegistered"
                  )
              })
              it("User should only be able to vote once per election", async () => {
                  await connectedUser.vote(1, owner.address)
                  await expect(connectedUser.vote(1, owner.address)).to.be.revertedWith(
                      "Voting__AlreadyVoted"
                  )
              })
              it("Emits an event for vote success", async () => {
                  await expect(connectedUser.vote(1, owner.address)).to.emit(voting, "VoteSuccess")
              })
              it("Returns vote amount of a candidate", async () => {
                  let connectedUser2 = voting.connect(user2)
                  connectedUser2.vote(1, owner.address)
                  connectedUser.vote(1, owner.address)
                  const aliceVoteCount = await voting.getVoteCount(owner.address, 1)
                  assert.equal(aliceVoteCount.toString(), "2")
              })
          })
      })
