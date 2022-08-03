// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";

error PollChain__AdjustSubmissionDeadline();
error PollChain__AdjustVoteDeadline();
error PollChain__OneSubmissionPerPoll();
error PollChain__OptionSubmissionOver();
error PollChain__VoteOver();
error PollChain__NotValidOption();
error PollChain__AlreadyVoted();

contract PollChain {
    using Counters for Counters.Counter;

    enum Submitted {
        NO,
        YES
    }

    struct Poll {
        uint256 pollId;
        address creator;
        string question;
        uint256 submitOptionDeadline;
        uint256 voteDeadline;
        mapping(uint256 => Submitter) submissions;
    }

    struct Submitter {
        uint256 pollId;
        uint256 submissionId;
        address submitter;
        string submittedOption;
        Submitted submitted;
        uint256 voteCount;
    }

    struct Voter {
        bool hasVoted;
    }

    Counters.Counter private s_pollIds;
    Counters.Counter private s_submissionIds;
    mapping(uint256 => Poll) private s_polls;
    mapping(address => mapping(uint256 => Voter)) s_voters;

    event PollCreated(
        address creator,
        uint256 indexed pollId,
        uint256 indexed submitOptionDeadline,
        uint256 indexed voteDeadLine
    );

    event PollOptionSubmitted(
        address indexed submitter,
        uint256 indexed pollId,
        uint256 indexed submissionId
    );

    event VoteSuccess(address indexed voter, uint256 indexed submission, uint256 indexed pollId);

    modifier isEnoughTime(uint256 submitOptionDeadline, uint256 voteDeadLine) {
        if (submitOptionDeadline <= block.timestamp) {
            revert PollChain__AdjustSubmissionDeadline();
        }
        if (voteDeadLine <= block.timestamp) {
            revert PollChain__AdjustVoteDeadline();
        }
        _;
    }

    modifier submitted(address _submitter, uint256 pollId) {
        uint256 submissionIds = s_submissionIds.current();
        for (uint256 i = 0; i < submissionIds; i++) {
            if (s_polls[pollId].submissions[submissionIds].submitter == _submitter) {
                revert PollChain__OneSubmissionPerPoll();
            }
        }
        _;
    }

    modifier submissionDeadLine(uint256 pollId) {
        if (block.timestamp >= s_polls[pollId].submitOptionDeadline) {
            revert PollChain__OptionSubmissionOver();
        }
        _;
    }

    modifier votingDeadline(uint256 pollId) {
        if (block.timestamp >= s_polls[pollId].voteDeadline) {
            revert PollChain__VoteOver();
        }
        _;
    }

    modifier isAnOption(uint256 pollId, uint256 submissionId) {
        if (s_polls[pollId].submissions[submissionId].submitted == Submitted.NO) {
            revert PollChain__NotValidOption();
        }
        _;
    }

    modifier hasVoted(address _voter, uint256 pollId) {
        Voter memory voter = s_voters[_voter][pollId];
        if (voter.hasVoted) {
            revert PollChain__AlreadyVoted();
        }
        _;
    }

    function createPoll(
        string memory question,
        uint256 submitOptionDeadline,
        uint256 voteDeadline
    ) public isEnoughTime(submitOptionDeadline, voteDeadline) {
        s_pollIds.increment();
        uint256 newPollId = s_pollIds.current();
        s_polls[newPollId].pollId = newPollId;
        s_polls[newPollId].creator = msg.sender;
        s_polls[newPollId].question = question;
        s_polls[newPollId].submitOptionDeadline = submitOptionDeadline;
        s_polls[newPollId].voteDeadline = voteDeadline;
        emit PollCreated(msg.sender, newPollId, submitOptionDeadline, voteDeadline);
    }

    function submitPollOption(uint256 pollId, string memory submissionOption)
        external
        submitted(msg.sender, pollId)
        submissionDeadLine(pollId)
    {
        s_submissionIds.increment();
        uint256 newSubmissionId = s_submissionIds.current();
        s_polls[pollId].submissions[newSubmissionId] = Submitter(
            pollId,
            newSubmissionId,
            msg.sender,
            submissionOption,
            Submitted.YES,
            0
        );
        emit PollOptionSubmitted(msg.sender, pollId, newSubmissionId);
    }

    function vote(uint256 pollId, uint256 submissionId)
        external
        isAnOption(pollId, submissionId)
        hasVoted(msg.sender, pollId)
        votingDeadline(pollId)
    {
        s_polls[pollId].submissions[submissionId].voteCount += 1;
        s_voters[msg.sender][pollId] = Voter(true);
        emit VoteSuccess(msg.sender, submissionId, pollId);
    }
}
