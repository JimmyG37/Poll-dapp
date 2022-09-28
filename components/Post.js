import Moment from "react-moment"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import Mint from "./Mint"
import { ethers } from "ethers"
import Tip from "./Tip"
import { Tooltip } from "@web3uikit/core"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { truncateStr } from "../helpers/truncateString"
import { unixToDate } from "../helpers/unixToDate"
import { useMoralis, useWeb3Contract } from "react-moralis"
import ChatBubble from "../styles/ChatBubble"
import Calendar from "../styles/Calendar"
import CountdownTimer from "./CountdownTimer"

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
    const [tipAmount, setTipAmount] = useState("")
    const [post, setPost] = useState(false)
    const router = useRouter()
    const { runContractFunction } = useWeb3Contract()

    const { runContractFunction: getPost } = useWeb3Contract({
        abi: PostChain.abi,
        contractAddress: postChainAddress,
        functionName: "getPost",
        params: {
            postId: postId,
        },
    })

    const handlePost = async () => {
        const returnedPost = await getPost()

        if (returnedPost) {
            setPostCreator(returnedPost.creator)
            setPostText(returnedPost.post)
            setDeadline(parseInt(returnedPost.likeAndCommentDeadline))
            setTotalComments(parseInt(returnedPost.totalComments))
            setDateCreated(unixToDate(returnedPost.dateCreated))
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
        }
    }, [isWeb3Enabled, postId])

    useEffect(() => {
        handleTipAmount()
    }, [])

    const formattedAddress = truncateStr(postCreator || "", 15)
    return (
        <div>
            <div onClick={() => router.push(`/${postId}`)}>
                <div className="postContainer cursor-pointer">
                    <div className="w-12">
                        <div className="h-11 w-11 rounded-full ">
                            <Jazzicon diameter={40} seed={jsNumberForAddress("" + postCreator)} />
                        </div>
                    </div>
                    <div className="space-y-2 w-full">
                        <div className="flex flex-row text-[#6e767d]">
                            <div className="inline-block">
                                <h4 className="font-bold text-[13px] sm:text-base text-black group-hover:underline inline-block">
                                    {formattedAddress}
                                </h4>
                            </div>{" "}
                            {!postPage && (
                                <span className="text-sm sm:text-[15px]">
                                    · <Moment fromNow>{dateCreated}</Moment> ·
                                </span>
                            )}
                            <div className="text-sm sm:text-[14px] pl-1 pr-15">
                                post id {postId}
                            </div>
                        </div>

                        <p className="text-black text-[15px] sm:text-base mt-0.5">{postText}</p>

                        {!postPage && (
                            <div className="flex flex-row pt-5">
                                <div className="pr-6">
                                    <ChatBubble color={"#A3EBB1"} size={20} strokeWidth={3} />
                                </div>
                                <Tooltip content="Tip" position="right">
                                    <Tip postCreator={postCreator} tipAmount={tipAmount} />
                                </Tooltip>
                            </div>
                        )}

                        {postPage && (
                            <span className="flex text-sm sm:text-[15px] text-[#6e767d] pt-3">
                                <Moment format="h:mm A">{dateCreated}</Moment> ·{" "}
                                <Moment format="MMM DD, YY">{dateCreated}</Moment>
                            </span>
                        )}
                    </div>
                    {/* {!postPage && (
                    <div>
                        {dateCreated < new Date() ? (
                            <Mint postId={postId} postCreator={postCreator} />
                        ) : null}
                    </div>
                )} */}
                    <Calendar deadline={deadline} />
                </div>
                {postPage && (
                    <div className="flex items-center justify-center  py-2 border-b border-gray-200">
                        <CountdownTimer deadline={deadline} />
                    </div>
                )}
            </div>
        </div>
    )
}
