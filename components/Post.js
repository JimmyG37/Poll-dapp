import Moment from "react-moment"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import Timer from "./Timer"
import Mint from "./Mint"
import { ethers } from "ethers"
import Tip from "./Tip"
import { Tooltip } from "web3uikit"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { truncateStr } from "../helpers/truncateString"
import { unixToDate } from "../helpers/unixToDate"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline"

export default function Post({ postId, postPage }) {
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
    const router = useRouter()
    const { runContractFunction } = useWeb3Contract()

    const handlePost = async () => {
        if (typeof postId === "string") {
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
            setTipAmount(returnedAmount.toString())
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handlePost()
            handleTipAmount()
        }
    }, [isWeb3Enabled, postId, postCreator])

    const formattedAddress = truncateStr(postCreator || "", 15)
    return (
        <div className="p-2 flex border-b border-gray-200">
            <div className="h-11 w-11 rounded-full mr-4">
                <Jazzicon diameter={40} seed={jsNumberForAddress("" + postCreator)} />
            </div>
            <div className="flex justify-between">
                <div className="flex flex-col space-y-2 w-auto">
                    <div className="text-[#6e767d]">
                        <div className="inline-block group">
                            <h4 className="font-bold text-[13px] sm:text-base text-black group-hover:underline inline-block">
                                {formattedAddress}
                            </h4>
                        </div>{" "}
                        {!postPage && (
                            <span className=" text-sm sm:text-[15px]">
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
                                    onClick={() => router.push(`/${postId}`)}
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
                    <div className="flex text-[#6e767d]">
                        <div className="rounded-[25px] bg-[#f8fafc] w-7 h-7 pl-0.5 pt-0.5 font-bold shadow-md hover:shadow-lg">
                            <Tooltip content="Tip" position="left">
                                <Tip postCreator={postCreator} tipAmount={tipAmount} />
                            </Tooltip>
                            {dateCreated < new Date() ? (
                                <Mint postId={postId} postCreator={postCreator} />
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
