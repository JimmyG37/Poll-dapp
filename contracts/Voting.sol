// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";

error Voting__AdjustRegistrationPeriod();
error Voting__AdjustVotingPeriod();
error Voting__AlreadyRegistered();
error Voting__RegistrationPeriodOver();
error Voting__VotePeriodOver();
error Voting__CandidateNotRegistered();
error Voting__AlreadyVoted();

contract Voting {
    using Counters for Counters.Counter;

    enum Registered {
        NO,
        YES
    }
    struct Election {
        string title;
        uint256 registrationPeriod;
        uint256 votingPeriod;
    }

    struct Candidate {
        string name;
        Registered isRegistered;
        uint256 voteCount;
    }

    struct Voter {
        bool hasVoted;
    }

    Counters.Counter private s_electionIds;
    mapping(uint256 => Election) private s_elections;
    mapping(address => mapping(uint256 => Candidate)) private s_candidates;
    mapping(address => mapping(uint256 => Voter)) s_voters;

    event ElectionCreated(
        uint256 indexed electionId,
        uint256 indexed registrationPeriod,
        uint256 indexed votingPeriod
    );

    event CandidateResgistered(address indexed candidate, uint256 indexed electionId);

    event VoteSuccess(address indexed voter, address indexed candidate, uint256 electionId);

    modifier timeCheck(uint256 registrationPeriod, uint256 votingPeriod) {
        if (registrationPeriod <= block.timestamp) {
            revert Voting__AdjustRegistrationPeriod();
        }
        if (votingPeriod <= block.timestamp) {
            revert Voting__AdjustVotingPeriod();
        }
        _;
    }

    modifier _isRegistered(address candidate, uint256 electionId) {
        Candidate memory _candidate = s_candidates[candidate][electionId];
        if (_candidate.isRegistered == Registered.YES) {
            revert Voting__AlreadyRegistered();
        }
        _;
    }

    modifier registerDeadLine(uint256 electionId) {
        Election memory election = s_elections[electionId];
        if (block.timestamp >= election.registrationPeriod) {
            revert Voting__RegistrationPeriodOver();
        }
        _;
    }

    modifier voteDeadline(uint256 electionId) {
        Election memory election = s_elections[electionId];
        if (block.timestamp >= election.votingPeriod) {
            revert Voting__VotePeriodOver();
        }
        _;
    }

    modifier candidateList(uint256 electionId, address candidate) {
        Candidate memory _candidate = s_candidates[candidate][electionId];
        if (_candidate.isRegistered == Registered.NO) {
            revert Voting__CandidateNotRegistered();
        }
        _;
    }

    modifier _hasVoted(address voter, uint256 electionId) {
        Voter memory _voter = s_voters[voter][electionId];
        if (_voter.hasVoted) {
            revert Voting__AlreadyVoted();
        }
        _;
    }

    function createElection(
        string memory _title,
        uint256 _registrationPeriod,
        uint256 _votingPeriod
    ) public timeCheck(_registrationPeriod, _votingPeriod) {
        s_electionIds.increment();
        uint256 newElectionId = s_electionIds.current();
        s_elections[newElectionId] = Election(_title, _registrationPeriod, _votingPeriod);
        emit ElectionCreated(newElectionId, _registrationPeriod, _votingPeriod);
    }

    function candidateRegistration(uint256 electionId, string memory _name)
        external
        _isRegistered(msg.sender, electionId)
        registerDeadLine(electionId)
    {
        s_candidates[msg.sender][electionId] = Candidate(_name, Registered.YES, 0);
        emit CandidateResgistered(msg.sender, electionId);
    }

    function vote(uint256 electionId, address candidate)
        external
        voteDeadline(electionId)
        candidateList(electionId, candidate)
        _hasVoted(msg.sender, electionId)
    {
        s_candidates[candidate][electionId].voteCount += 1;
        s_voters[msg.sender][electionId] = Voter(true);
        emit VoteSuccess(msg.sender, candidate, electionId);
    }

    function getVoteCount(address candidate, uint256 electionId) external view returns (uint256) {
        return s_candidates[candidate][electionId].voteCount;
    }

    function getCandidate(address candidate, uint256 electionId)
        external
        view
        returns (Candidate memory)
    {
        return s_candidates[candidate][electionId];
    }

    function getElection(uint256 electionId) external view returns (Election memory) {
        return s_elections[electionId];
    }
}
