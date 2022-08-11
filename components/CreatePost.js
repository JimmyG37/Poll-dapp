import { useEffect, useState } from "react"
import { DatePicker, useNotification } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

export default function CreatePost() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const dispatch = useNotification()
    const [postText, setPostText] = useState("")
    const [likeDeadline, setLikeDeadline] = useState(0)
    const [commentDeadline, setCommentDeadline] = useState(0)

    const { runContractFunction } = useWeb3Contract()

    const createPost = async (e) => {
        e.preventDefault()
        const postOptions = {
            abi: postChainAbi,
            contractAddress: postChainAddress,
            functionName: "createPost",
            params: {
                post: postText,
                commentDeadline: commentDeadline,
                likeDeadline: likeDeadline,
            },
        }

        await runContractFunction({
            params: postOptions,
            onSuccess: () => handlePostSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
        setPostText("")
    }

    const handlePostSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Post Created!",
            title: "Success",
            position: "topR",
        })
    }

    const handleLikeDeadline = ({ date }) => {
        const dateToUnix = Math.floor(new Date(date).getTime() / 1000)
        setLikeDeadline(dateToUnix)
    }

    const handleCommentDeadline = ({ date }) => {
        const dateToUnix = Math.floor(new Date(date).getTime() / 1000)
        setCommentDeadline(dateToUnix)
    }

    return (
        <div className="border-b border-gray-200 p-3 flex space-x-3 overflow-y-scroll scrollbar-hide ">
            <div className="h-11 w-11 rounded-full mr-4">
                <Jazzicon diameter={40} seed={jsNumberForAddress("" + account)} />
            </div>
            <div className="  w-full">
                <div className="pb-7 space-y-2.5">
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="What's Gucci?"
                        rows="2"
                        className="bg-transparent outline-none text-black text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px]"
                    />
                </div>
                <div className="flex items-center justify-between pt-2.5">
                    <DatePicker
                        id="date-picker"
                        label="Like Dealine"
                        onChange={(data) => handleLikeDeadline(data)}
                    />
                    <button
                        className="bg-[#1d9bf0] text-slate-50 rounded-full px-14 py-2 font-bold shadow-md hover:bg-[#1a8cd8] disabled:hover:bg-[#1d9bf0] disabled:opacity-50 disabled:cursor-default"
                        onClick={(e) => createPost(e)}
                    >
                        Post
                    </button>
                    <DatePicker
                        id="date-picker"
                        label="Comment Dealine"
                        onChange={(data) => handleCommentDeadline(data)}
                    />
                </div>
            </div>
        </div>
    )
}
