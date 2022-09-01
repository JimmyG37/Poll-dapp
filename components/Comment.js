import Moment from "react-moment"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { HeartIcon } from "@heroicons/react/outline"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const seperator = "..."
    let seperatorLength = seperator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 3)
    return (
        fullStr.substring(0, frontChars) + seperator + fullStr.substring(fullStr.length - backChars)
    )
}

const unixToDate = (u) => {
    let newDate = new Date(u * 1000)
    return newDate
}

export default function Comment({ id }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const [commenter, setCommenter] = useState(null)
    const [comment, setComment] = useState("")
    const [timeCreated, setTimeCreated] = useState(0)
    const [commentLikes, setCommentLikes] = useState(0)
    const [postId, setPostId] = useState(0)
    const commentId = parseInt(id)
    const { runContractFunction } = useWeb3Contract()
    const formattedAddress = truncateStr(commenter || "", 15)

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
        }
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
    }, [isWeb3Enabled, commentId])

    return (
        <div className="p-3 flex border-b border-gray-200">
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
                <div
                    className="flex items-center space-x-1 group"
                    onClick={() => likeComment(postId, commentId)}
                >
                    <div className="icon group-hover:bg-slate-50">
                        <HeartIcon className="h-4 group-hover:text-red-600" />
                    </div>
                </div>
            </div>
        </div>
    )
}
