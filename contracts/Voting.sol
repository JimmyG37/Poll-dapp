// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";

error Voting__AdjustRegistrationPeriod();
error Voting__AdjustVotingPeriod();
error Voting__AlreadyRegistered();
error Voting__RegistrationPeriodOver();

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
        uint256 electionId;
    }

    Counters.Counter private s_electionIds;
    mapping(uint256 => Election) private s_elections;
    mapping(address => mapping(uint256 => Candidate)) private s_candidates;
    mapping(address => uint256[]) private s_voterToElectionId;

    event ElectionCreated(
        uint256 indexed electionId,
        uint256 indexed registrationPeriod,
        uint256 indexed votingPeriod
    );

    event CandidateResgistered(address indexed candidate, uint256 indexed electionId);

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
