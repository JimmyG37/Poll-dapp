import Tip from "../components/Tip"
import Moment from "react-moment"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useNotification, Tooltip } from "@web3uikit/core"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useComment } from "../hooks/useComment"
import { useTruncate } from "../hooks/useTruncate"
import { HeartIcon } from "@heroicons/react/24/outline"
import HeartFill from "./HeartFill"

export default function Comment({ commentId, tipAmount, totalLikes, totalComments, postId }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const [commenter, comment, timeCreated, commentLikes, likePercent] = useComment(
        commentId,
        totalLikes
    )
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi

    const { runContractFunction } = useWeb3Contract()
    const formattedAddress = useTruncate(commenter || "", 15)
    const dispatch = useNotification()

    const likeComment = async (postId, commentId) => {
        const likeOptions = {
            abi: postChainAbi,
            contractAddress: postChainAddress,
            functionName: "likeComment",
            params: {
                postId: postId,
                commentId: commentId,
            },
        }

        await runContractFunction({
            params: likeOptions,
            onSuccess: handleLikeSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
    }

    const handleLikeSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Comment Liked!",
            title: "Success",
            position: "topR",
        })
    }

    useEffect(() => {}, [isWeb3Enabled, commentId, totalLikes, totalComments])

    useEffect(() => {}, [commenter, comment, timeCreated, commentLikes, likePercent])

    return (
        <div className="commentContainer">
            <div className="commentFields">
                <div className="flex pl-4  mt-6">
                    <div className="pfpContainer w-[3.0rem] h-[3.0rem] z-10 mr-5">
                        <Jazzicon diameter={80} seed={jsNumberForAddress("" + commenter)} />
                    </div>
                    <div className="likePercentage">{likePercent || 0}%</div>
                    <HeartFill />
                    <div className="commentInfo">
                        <h4
                            className="addressBar"
                            style={{
                                border: "1px solid rgba(0,0,0,0.25)",
                                borderTop: "2px solid #f43f5E",
                            }}
                        >
                            {formattedAddress}
                        </h4>
                        <div className="commentTime">
                            <Moment fromNow>{timeCreated}</Moment>
                        </div>
                    </div>
                </div>
                <p className="comment">{comment}</p>
                <div className="commentFooter">
                    <div className="flex pr-5" onClick={() => likeComment(postId, commentId)}>
                        <HeartIcon className="h-4  cursor-pointer text-[#f43f5E] hover:text-red-800" />
                    </div>
                    <Tip postCreator={commenter} tipAmount={tipAmount} />
                </div>
            </div>
            <div
                className="barGraph"
                style={{
                    width: `${likePercent}%`,
                    border: "1px solid rgba(255,99,132,0.25)",
                    transition: "width 1s ease-in-out",
                }}
            ></div>
        </div>
    )
}
