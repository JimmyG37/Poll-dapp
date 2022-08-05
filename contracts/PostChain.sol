// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

error PostChain__AdjustCommentDeadline();
error PostChain__AdjustLikeDeadline();
error PostChain__OneCommentPerPost();
error PostChain__CommentDeadline(uint256 commentDeadline);
error PostChain__LikeDeadline(uint256 likeDeadline);
error PostChain__CommentNotFound();
error PostChain__OneLikePerPost();

/** @title A contract for posts, comments and likes happening on chain
 *  @author Jimmy Garcia
 *  @notice Anyone can make a post with a comment deadline and a like deadline
 *  @notice Users can write one comment per post, within deadline
 *  @notice Users can like one comment per post, within deadline
 *  @dev This implements counters to identify posts and comments
 */
contract PostChain {
    using Counters for Counters.Counter;

    enum Commented {
        NO,
        YES
    }

    struct Post {
        address creator;
        string post;
        uint256 postId;
        uint256 dateCreated;
        uint256 commentDeadline;
        uint256 likeDeadline;
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
        Commented hasCommented;
    }

    struct Like {
        bool liked;
        uint256 postId;
        uint256 commentId;
    }

    Counters.Counter private s_postIds;
    Counters.Counter private s_commentIds;
    mapping(uint256 => Post) private s_posts;
    mapping(uint256 => Comment) private s_comments;
    mapping(address => mapping(uint256 => Like)) private s_userToLikes;

    event PostCreated(
        address indexed creator,
        uint256 indexed postId,
        uint256 indexed likeDeadline
    );

    event RepliedToPost(
        address indexed commenter,
        uint256 indexed postId,
        uint256 indexed commentId
    );

    event CommentLiked(address indexed user, uint256 indexed commentId, uint256 indexed postId);

    modifier isEnoughTime(uint256 commentDeadline, uint256 likeDeadline) {
        if (commentDeadline <= block.timestamp) {
            revert PostChain__AdjustCommentDeadline();
        }
        if (likeDeadline <= block.timestamp) {
            revert PostChain__AdjustLikeDeadline();
        }
        _;
    }

    modifier commented(address _commenter, uint256 postId) {
        uint256 commentIds = s_commentIds.current();
        for (uint256 i = 0; i < commentIds; i++) {
            Comment memory comment = s_comments[i + 1];
            if (comment.commenter == _commenter) {
                if (comment.hasCommented == Commented.YES) {
                    revert PostChain__OneCommentPerPost();
                }
            }
        }
        _;
    }

    modifier replyDeadLine(uint256 postId) {
        Post memory post = s_posts[postId];
        if (block.timestamp >= post.commentDeadline) {
            revert PostChain__CommentDeadline(post.commentDeadline);
        }
        _;
    }

    modifier _likeDeadline(uint256 postId) {
        Post memory post = s_posts[postId];
        if (block.timestamp >= post.likeDeadline) {
            revert PostChain__LikeDeadline(post.likeDeadline);
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
            revert PostChain__OneLikePerPost();
        }
        _;
    }

    /*
     * @notice Users can create a post with a comment deadline and a like deadline
     * @dev A new id is created to identify Post struct
     * @param post: user written string
     * @param commentDeadline: deadline for users to comment on post
     * @param likeDeadline: deadline for users to like a comment on post
     */
    function createPost(
        string memory post,
        uint256 commentDeadline,
        uint256 likeDeadline
    ) public isEnoughTime(commentDeadline, likeDeadline) {
        s_postIds.increment();
        uint256 newPostId = s_postIds.current();
        s_posts[newPostId] = Post(
            msg.sender,
            post,
            newPostId,
            block.timestamp,
            commentDeadline,
            likeDeadline,
            0,
            0
        );
        emit PostCreated(msg.sender, newPostId, likeDeadline);
    }

    /*
     * @notice Users can only comment once per post within deadline
     * @dev A new id is created to identify Comment struct
     * @dev Increments the total number of comments in current post
     * @param postId: identifier for current post
     * @param comment: string reply to post
     */
    function replyToPost(uint256 postId, string memory comment)
        external
        commented(msg.sender, postId)
        replyDeadLine(postId)
    {
        s_commentIds.increment();
        uint256 newCommentId = s_commentIds.current();
        s_comments[newCommentId] = Comment(
            msg.sender,
            postId,
            newCommentId,
            comment,
            block.timestamp,
            0,
            Commented.YES
        );
        s_posts[postId].totalComments += 1;
        emit RepliedToPost(msg.sender, postId, newCommentId);
    }

    /*
     * @notice Users can like only one comment per post, within likeDeadline of current post
     * @dev a new Like struct created with: if user has liked a comment, current post, current comment
     * @dev Increments number of likes of current comment
     * @dev Increments total number of likes given in current post
     * @param postId: identifier for current post
     * @param commentId: identifier for current comment
     */
    function likeComment(uint256 postId, uint256 commentId)
        external
        hasLiked(msg.sender, postId, commentId)
        _likeDeadline(postId)
    {
        s_userToLikes[msg.sender][postId] = Like(true, postId, commentId);
        incrementCommentLikes(commentId);
        incrementPostLikes(postId);
        emit CommentLiked(msg.sender, commentId, postId);
    }

    function incrementPostLikes(uint256 postId) private {
        Post storage post = s_posts[postId];
        post.totalLikes += 1;
    }

    function incrementCommentLikes(uint256 commentId) private {
        s_comments[commentId].likes += 1;
    }

    function verifyCommentToPost(uint256 commentId, uint256 postId) private view returns (bool) {
        Comment memory comment = s_comments[commentId];
        if (comment.postId == postId) {
            return true;
        }
        return false;
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
}
