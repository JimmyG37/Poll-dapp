import { useEffect, useState, useContext } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { gql, useQuery } from "@apollo/client"
import { PostContext } from "../hooks/PostContext"
import ReplyToPost from "./ReplyToPost"
import Comment from "./Comment"
import CountdownTimer from "./CountdownTimer"
import GET_COMMENTS from "../constants/queryComments"

export default function CommentSection({ isOpen, showComments, tipAmount }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const { loading, error, data, startPolling, stopPolling } = useQuery(GET_COMMENTS)
    const { post } = useContext(PostContext)

    useEffect(() => {}, [isWeb3Enabled, isOpen])

    useEffect(() => {}, [post])

    useEffect(() => {
        startPolling(2000)
        return () => {
            stopPolling()
        }
    }, [startPolling, stopPolling])

    return (
        <>
            {isOpen && isWeb3Enabled ? (
                !data ? (
                    <div>Loading...</div>
                ) : (
                    <div className={`commentSection`}>
                        <div
                            className="commentCountdown commentShadow"
                            onClick={() => showComments(``)}
                        >
                            <CountdownTimer deadline={post.deadline} />
                        </div>
                        {data.comments.length > 0 &&
                            data.comments.map((comment) => {
                                if (comment.postId == post.postId) {
                                    return (
                                        <Comment
                                            key={`${comment.id}${comment.commentId}`}
                                            commentId={parseInt(comment.commentId)}
                                            tipAmount={tipAmount}
                                            totalLikes={post.totalLikes}
                                            totalComments={post.totalComments}
                                            deadline={post.deadline}
                                            postId={post.postId}
                                        />
                                    )
                                }
                            })}
                        <div className="commentPost commentShadow">
                            {new Date(post.deadline * 1000) <= new Date() ? null : (
                                <ReplyToPost postId={post.postId} />
                            )}
                        </div>
                    </div>
                )
            ) : null}
        </>
    )
}
