// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";

error Voting__AdjustRegistrationPeriod();
error Voting__AdjustVotingPeriod();

contract Voting {
    using Counters for Counters.Counter;
    enum Registration {
        OPEN,
        CLOSED
    }

    enum Vote {
        OPEN,
        CLOSED
    }
    struct Election {
        string title;
        uint256 registrationPeriod;
        uint256 votingPeriod;
        Registration registrationState;
        Vote voteState;
    }

    struct Candidate {
        string name;
        string description;
        uint256 voteCount;
    }

    struct Voter {
        bool hasVoted;
        uint256 electionId;
    }

    Counters.Counter private s_electionIds;
    mapping(uint256 => Election) private s_elections;
    mapping(address => Candidate) private s_candidates;
    mapping(address => uint256[]) private s_voterToElectionId;

    /* Events */
    event ElectionCreated(
        uint256 indexed electionId,
        uint256 indexed registrationPeriod,
        uint256 indexed votingPeriod
    );

    modifier timeCheck(uint256 registrationPeriod, uint256 votingPeriod) {
        if (registrationPeriod <= block.timestamp) {
            revert Voting__AdjustRegistrationPeriod();
        }
        if (votingPeriod <= block.timestamp) {
            revert Voting__AdjustVotingPeriod();
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
        s_elections[newElectionId] = Election(
            _title,
            _registrationPeriod,
            _votingPeriod,
            Registration.OPEN,
            Vote.OPEN
        );
        emit ElectionCreated(newElectionId, _registrationPeriod, _votingPeriod);
    }

    function getElection(uint256 electionId) external view returns (Election memory) {
        return s_elections[electionId];
    }
}
