import { useEffect, useState } from "react"
import { DatePicker, useNotification } from "@web3uikit/core"
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
    const [deadline, setDeadline] = useState(0)

    const { runContractFunction } = useWeb3Contract()

    const createPost = async (e) => {
        e.preventDefault()
        const postOptions = {
            abi: postChainAbi,
            contractAddress: postChainAddress,
            functionName: "createPost",
            params: {
                post: postText,
                likeAndCommentDeadline: deadline,
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

    const handlePostSuccess = async () => {
        dispatch({
            type: "success",
            message: "Post Created!",
            title: "Success",
            position: "topR",
        })
    }

    const handleDeadline = ({ event }) => {
        const date = event.target.value
        const formattedDate = new Date(date.replace(/-/g, "/"))
        const dateToUnix = Math.floor(new Date(formattedDate).getTime() / 1000)
        setDeadline(dateToUnix)
    }

    return (
        <div className="border-b border-gray-200 p-3 flex space-x-3 overflow-y-scroll scrollbar-hide">
            <div className="pfpContainer w-[3.0rem] h-[2.6rem]">
                <Jazzicon diameter={80} seed={jsNumberForAddress("" + account)} />
            </div>
            <div className="w-full">
                <div className="pb-7 space-y-2.5">
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="What's Gucci?"
                        rows="2"
                        className="bg-transparent outline-none text-black text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px]"
                    />
                </div>
                <div className="flex space-x-3 pt-2.5">
                    <DatePicker
                        id="date-picker"
                        label="Set Deadline"
                        onChange={(data) => handleDeadline(data)}
                        value=""
                        type="date"
                    />
                    <button className="submitButton" onClick={(e) => createPost(e)}>
                        Post
                    </button>
                </div>
            </div>
        </div>
    )
}
