import Tip from "../components/Tip"
import Moment from "react-moment"
import BarGraph from "./BarGraph"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useNotification, Tooltip } from "@web3uikit/core"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { HeartIcon } from "@heroicons/react/24/outline"
import { truncateStr } from "../helpers/truncateString"
import { unixToDate } from "../helpers/unixToDate"
// import { Tooltip } from "web3uikit"

export default function Comment({ id, tipAmount, totalLikes }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const [commenter, setCommenter] = useState(null)
    const [comment, setComment] = useState("")
    const [timeCreated, setTimeCreated] = useState(0)
    const [commentLikes, setCommentLikes] = useState(0)
    const [postId, setPostId] = useState(0)
    const [likePercent, setLikePercent] = useState(0)
    const commentId = parseInt(id)
    const { runContractFunction } = useWeb3Contract()
    const formattedAddress = truncateStr(commenter || "", 15)
    const dispatch = useNotification()

    const handleComment = async () => {
        const returnedComment = await runContractFunction({
            params: {
                abi: PostChain.abi,
                contractAddress: postChainAddress,
                functionName: "getComment",
                params: {
                    commentId: commentId,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedComment) {
            let createdDate = unixToDate(returnedComment.timeCreated)
            setCommenter(returnedComment.commenter)
            setComment(returnedComment.comment)
            setTimeCreated(createdDate)
            setCommentLikes(parseInt(returnedComment.likes))
            setPostId(returnedComment.postId.toNumber())
            let percentage = calculatePercent(commentLikes, totalLikes)
            setLikePercent(Math.floor(percentage))
        }
    }

    const calculatePercent = (partialValue, totalValue) => {
        return (100 * partialValue) / totalValue
    }

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
            onSuccess: () => handleLikeSuccess,
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

    useEffect(() => {
        if (isWeb3Enabled) {
            handleComment()
        }
    }, [isWeb3Enabled, id, commentId, likePercent])
    return (
        <div className="border-b border-gray-200 flex relative">
            <BarGraph likePercent={likePercent} />
            <div className="p-3 flex relative">
                <div className="h-11 w-11 rounded-full mr-5">
                    <Jazzicon diameter={40} seed={jsNumberForAddress("" + commenter)} />
                </div>
                <div className="flex flex-col space-y-2 w-full">
                    <div className="flex justify-between">
                        <div className="text-[#6e767d]">
                            <div className="inline-block group">
                                <span className="ml-1.5 text-sm sm:text-[15px] group-hover:underline">
                                    @{formattedAddress}
                                </span>
                            </div>{" "}
                            ·{" "}
                            <span className="text-sm sm:text-[15px]">
                                <Moment fromNow>{timeCreated}</Moment>
                            </span>
                            <p className="text-black mt-0.5 max-w-lg overflow-scroll text-[15px] sm:text-base">
                                {comment}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="flex pr-5" onClick={() => likeComment(postId, commentId)}>
                            <HeartIcon className="h-4 mt-1 cursor-pointer hover:text-red-600" />
                            <span className="pl-2 text-[#6e767d] sm:text-[14px]">
                                {likePercent}%
                            </span>
                        </div>
                        <Tooltip content="Tip" position="right">
                            <Tip postCreator={commenter} tipAmount={tipAmount} />
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    )
}
