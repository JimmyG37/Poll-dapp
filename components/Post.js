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
import { useTruncate } from "../hooks/useTruncate"
import { useMoralis, useWeb3Contract } from "react-moralis"
import Image from "next/image"
import ChatBubble from "./ChatBubble"
import Calendar from "./Calendar"
import CountdownTimer from "./CountdownTimer"
import { useTokenURI } from "../hooks/useTokenURI"

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
    const [imageURI] = useTokenURI(postId)
    const formattedAddress = useTruncate(postCreator || "", 15)
    const [isOpen, setIsOpen] = useState(false)
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
            setDateCreated(new Date(returnedPost.dateCreated * 1000))
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
    }, [imageURI])

    return (
        <div className="trapdoor w-full">
            <div
                className={`flex w-max h-[50%] absolute door ${
                    isOpen ? "top-[-50%] doorShadow" : "topslide before:top-[5px] "
                }`}
            >
                <div className="flex w-full pl-4 pt-5  ">
                    <div className="pfpContainer w-[3.1rem] h-[3.0rem] z-10">
                        <Jazzicon diameter={80} seed={jsNumberForAddress("" + postCreator)} />
                    </div>
                    <div className="h-4 w-25 items-center justify-center z-3  mt-8 -ml-4">
                        <h4 className="addressBar opacity-[2] border-indigo-500 ">
                            {formattedAddress}
                        </h4>
                        <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                            {dateCreated < new Date() ? (
                                <Mint postId={postId} postCreator={postCreator} />
                            ) : null}
                        </div>
                    </div>
                </div>
                <Calendar className="order-last" deadline={deadline} />
            </div>
            <div>
                <div
                    className={`w-[100%] h-[50%] absolute door pl-4 ${
                        isOpen ? "top-[100%] doorShadow" : "bottomslide before:top-[-20px]"
                    }`}
                >
                    <p className="text-black text-[15px] sm:text-base pt-1 ">{postText}</p>
                    <div className="flex flex-row pt-6">
                        <div
                            className="pr-6 cursor-pointer"
                            onClick={() => router.push(`/${postId}`)}
                        >
                            <ChatBubble color={"#A3EBB1"} size={20} strokeWidth={3} />
                        </div>
                        <Tooltip content="Tip" position="right">
                            <Tip postCreator={postCreator} tipAmount={tipAmount} />
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div className="flex pl-5 items-center justify-center">
                {imageURI ? <Image src={imageURI} height="150" width="400" /> : null}
            </div>
            {postPage && (
                <div className="flex items-center justify-center  py-2 border-b border-gray-200">
                    <CountdownTimer deadline={deadline} />
                </div>
            )}
        </div>
    )
}
