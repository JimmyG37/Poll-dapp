import { useEffect, useState } from "react"
import { useNotification } from "@web3uikit/core"
import { useMoralis, useWeb3Contract } from "react-moralis"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

export default function ReplyToPost({ postId }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const dispatch = useNotification()
    const [commentText, setCommentText] = useState("")
    const { runContractFunction } = useWeb3Contract()

    const handleComment = async (e) => {
        e.preventDefault()
        const commentOptions = {
            abi: postChainAbi,
            contractAddress: postChainAddress,
            functionName: "replyToPost",
            params: {
                postId: postId,
                comment: commentText,
            },
        }

        await runContractFunction({
            params: commentOptions,
            onSuccess: () => handleCommentSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
        setCommentText("")
    }

    const handleCommentSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Comment Created!",
            title: "Success",
            position: "topR",
        })
    }

    return (
        <div className="border-b border-[#373737] overflow-hidden">
            <div className="flex px-4 pt-5 pb-2.5 ">
                <div className="w-full">
                    <div className="text-[#6e767d] flex flex-row ">
                        <div className="pfpContainer w-[2.7rem] h-[2.0rem] mr-5">
                            <Jazzicon diameter={80} seed={jsNumberForAddress("" + account)} />
                        </div>

                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Reply to post"
                            rows="2"
                            className="widgetInput"
                        />

                        <div className="pl-3 pt-1">
                            <button
                                className="widgetButton"
                                type="submit"
                                onClick={(e) => handleComment(e)}
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
