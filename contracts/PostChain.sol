// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

error PostChain__AdjustDeadline();
error PostChain__Deadline(uint256 deadline);
error PostChain__AlreadyLiked();
error PostChain__TipAmountNotMet(uint256 tipAmount);
error PostChain__YouAreNotTheOwner();
error PostChain__EmptyBalance();
error PostChain_WithdrawFailed();

/** @title A contract for posts, comments and likes happening on chain
 *  @author Jimmy Garcia
 *  @notice Anyone can make a post with a comment deadline and a like deadline
 *  @notice Users can write comment, within comment deadline
 *  @notice Users can like comments, within like deadline
 *  @dev This implements counters to identify posts and comments
 */
contract PostChain {
    using Counters for Counters.Counter;

    struct Post {
        address creator;
        string post;
        uint256 postId;
        uint256 dateCreated;
        uint256 likeAndCommentDeadline;
        uint256 totalComments;
        uint256 totalLikes;
    }

    struct Comment {
        address commenter;
        uint256 postId;
        uint256 commentId;
        string comment;
        uint256 timeCreated;
        uint256 likes;
    }

    struct Like {
        bool liked;
        uint256 postId;
        uint256 commentId;
    }

    uint256 private tipAmount = 0.001 ether;
    address private immutable i_owner;
    Counters.Counter private s_postIds;
    Counters.Counter private s_commentIds;
    mapping(address => uint256) private s_proceeds;
    mapping(uint256 => Post) private s_posts;
    mapping(uint256 => Comment) private s_comments;
    mapping(address => mapping(uint256 => Like)) private s_userToLikes;

    event PostCreated(address indexed creator, uint256 indexed postId, uint256 indexed deadline);

    event RepliedToPost(
        address indexed commenter,
        uint256 indexed postId,
        uint256 indexed commentId
    );

    event CommentLiked(address indexed user, uint256 indexed commentId, uint256 indexed postId);

    event UserTipped(address tipper, address user, uint256 tip);

    constructor() {
        i_owner = msg.sender;
    }

    modifier isEnoughTime(uint256 _deadline) {
        if (_deadline <= block.timestamp) {
            revert PostChain__AdjustDeadline();
        }
        _;
    }

    modifier checkDeadline(uint256 postId) {
        Post memory post = s_posts[postId];
        if (block.timestamp >= post.likeAndCommentDeadline) {
            revert PostChain__Deadline(post.likeAndCommentDeadline);
        }
        _;
    }

    modifier hasLiked(
        address user,
        uint256 commentId,
        uint256 postId
    ) {
        Like memory like = s_userToLikes[user][postId];
        bool correctPost = verifyCommentToPost(commentId, postId);
        if (correctPost && like.liked) {
            revert PostChain__AlreadyLiked();
        }
        _;
    }

    function updateTipAmount(uint256 newTipAmount) public payable {
        if (i_owner != msg.sender) {
            revert PostChain__YouAreNotTheOwner();
        }
        tipAmount = newTipAmount;
    }

    /*
     * @notice Users can create a post with a deadline to like and comment
     * @dev A new id is created to identify Post struct
     * @param post: user written string
     * @param likeAndCommentDeadline: deadline for users to like comments and comment on the post
     */
    function createPost(string memory post, uint256 likeAndCommentDeadline)
        public
        isEnoughTime(likeAndCommentDeadline)
    {
        s_postIds.increment();
        uint256 newPostId = s_postIds.current();
        s_posts[newPostId] = Post(
            msg.sender,
            post,
            newPostId,
            block.timestamp,
            likeAndCommentDeadline,
            0,
            0
        );
        emit PostCreated(msg.sender, newPostId, likeAndCommentDeadline);
    }

    /*
     * @notice Users can reply to a post within deadline
     * @dev A new id is created to identify Comment struct
     * @dev Increments the total number of comments in current post
     * @param postId: identifier for current post
     * @param comment: string reply to post
     */
    function replyToPost(uint256 postId, string memory comment) external checkDeadline(postId) {
        s_commentIds.increment();
        uint256 newCommentId = s_commentIds.current();
        s_comments[newCommentId] = Comment(
            msg.sender,
            postId,
            newCommentId,
            comment,
            block.timestamp,
            0
        );
        s_posts[postId].totalComments += 1;
        emit RepliedToPost(msg.sender, postId, newCommentId);
    }

    /*
     * @notice Users can like comments in a post, within deadline of current post
     * @dev a new Like struct created with: if user has liked a comment, current post, current comment
     * @dev Increments number of likes of current comment
     * @dev Increments total number of likes given in current post
     * @param postId: identifier for current post
     * @param commentId: identifier for current comment
     */
    function likeComment(uint256 postId, uint256 commentId)
        external
        hasLiked(msg.sender, postId, commentId)
        checkDeadline(postId)
    {
        s_userToLikes[msg.sender][postId] = Like(true, postId, commentId);
        incrementCommentLikes(commentId);
        incrementPostLikes(postId);
        emit CommentLiked(msg.sender, commentId, postId);
    }

    function tipUser(address userAddress) external payable {
        if (msg.value < tipAmount) {
            revert PostChain__TipAmountNotMet(tipAmount);
        }
        s_proceeds[userAddress] += msg.value;
        emit UserTipped(msg.sender, userAddress, msg.value);
    }

    function withdrawBalances() external {
        uint256 balance = s_proceeds[msg.sender];
        if (balance <= 0) {
            revert PostChain__EmptyBalance();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        if (!success) {
            revert PostChain_WithdrawFailed();
        }
    }

    function incrementPostLikes(uint256 postId) private {
        Post storage post = s_posts[postId];
        post.totalLikes += 1;
    }

    function incrementCommentLikes(uint256 commentId) private {
        s_comments[commentId].likes += 1;
    }

    function verifyCommentToPost(uint256 commentId, uint256 postId) public view returns (bool) {
        Comment memory comment = s_comments[commentId];
        return (comment.postId == postId);
    }

    function getPost(uint256 postId) external view returns (Post memory) {
        return s_posts[postId];
    }

    function getComment(uint256 commentId) external view returns (Comment memory) {
        return s_comments[commentId];
    }

    function getUserLike(address user, uint256 postId) external view returns (Like memory) {
        return s_userToLikes[user][postId];
    }

    function getTipAmount() public view returns (uint256) {
        return tipAmount;
    }

    function getProceeds(address user) public view returns (uint256) {
        return s_proceeds[user];
    }
}
