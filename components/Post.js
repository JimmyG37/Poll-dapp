import Moment from "react-moment"
import moment from "moment"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import Timer from "./Timer"
import Tip from "./Tip"
import { Tooltip } from "web3uikit"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline"

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

export default function Post({ id, postPage }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const [postCreator, setPostCreator] = useState(null)
    const [postText, setPostText] = useState("")
    const [deadline, setDeadline] = useState(0)
    const [dateCreated, setDateCreated] = useState(0)
    const [totalComments, setTotalComments] = useState(0)
    const [totalLikes, setTotalLikes] = useState(0)
    const [tipAmount, setTipAmount] = useState(null)
    const postId = parseInt(id)
    const router = useRouter()
    const { runContractFunction } = useWeb3Contract()

    const handlePost = async () => {
        if (typeof postId !== "number") {
            postId = parseInt(postId)
        }
        const returnedPost = await runContractFunction({
            params: {
                abi: PostChain.abi,
                contractAddress: postChainAddress,
                functionName: "getPost",
                params: {
                    postId: postId,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedPost) {
            let createdDate = unixToDate(returnedPost.dateCreated)
            setPostCreator(returnedPost.creator)
            setDeadline(parseInt(returnedPost.likeAndCommentDeadline))
            setPostText(returnedPost.post)
            setTotalComments(parseInt(returnedPost.totalComments))
            setTotalLikes(parseInt(returnedPost.totalLikes))
            setDateCreated(createdDate)
        }
    }

    const handleTipAmount = async () => {
        const returnedAmount = await runContractFunction({
            params: {
                abi: PostChain.abi,
                contractAddress: postChainAddress,
                functionName: "getTipAmount",
            },
            onError: (error) => console.log(error),
        })

        if (returnedAmount) {
            setTipAmount(returnedAmount.toNumber())
        }
    }

    const unixToDate = (u) => {
        let newDate = new Date(u * 1000)
        return newDate
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handlePost()
            handleTipAmount()
        }
    }, [chainId, account, isWeb3Enabled, id])

    const formattedAddress = truncateStr(postCreator || "", 15)
    return (
        <div className="p-2 flex border-b border-gray-200">
            <div className="h-11 w-11 rounded-full mr-4">
                <Jazzicon diameter={40} seed={jsNumberForAddress("" + postCreator)} />
            </div>
            <div className="flex justify-between">
                <div className="flex flex-col space-y-2 w-full">
                    <div className="text-[#6e767d]">
                        <div className="inline-block group">
                            <h4 className="font-bold text-[13px] sm:text-base text-black group-hover:underline inline-block">
                                {formattedAddress}
                            </h4>
                        </div>{" "}
                        {!postPage && (
                            <span className="text-sm sm:text-[15px]">
                                · <Moment fromNow>{dateCreated}</Moment>
                            </span>
                        )}
                    </div>

                    <p className="text-black text-[15px] sm:text-base mt-0.5">{postText}</p>
                    {!postPage && (
                        <div className="flex pt-5">
                            <div className="pb-4 pr-12">
                                <ChatBubbleOvalLeftIcon
                                    className="h-7 text-green-600 cursor-pointer"
                                    onClick={() => router.push(`/${id}`)}
                                />
                            </div>

                            <Timer deadline={deadline} />
                        </div>
                    )}
                    {postPage && (
                        <span className="flex text-sm sm:text-[15px] text-[#6e767d] pt-3">
                            <Moment format="h:mm A">{dateCreated}</Moment> ·{" "}
                            <Moment format="MMM DD, YY">{dateCreated}</Moment>·{" "}
                            <Tooltip content="Tip" position="right">
                                <Tip postCreator={postCreator} tipAmount={tipAmount} />
                            </Tooltip>
                        </span>
                    )}
                </div>
                {!postPage && (
                    <div className="flex-shrink-0 ml-auto text-[#6e767d]">
                        <Tooltip content="Tip" position="left">
                            <Tip postCreator={postCreator} tipAmount={tipAmount} />
                        </Tooltip>
                    </div>
                )}
            </div>
        </div>
    )
}
