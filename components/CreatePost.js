import { useEffect, useState } from "react"
import { useNotification } from "@web3uikit/core"
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
    const [datePicker, setDatePicker] = useState("")

    const { runContractFunction } = useWeb3Contract()

    const createPost = async (e) => {
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
            onSuccess: handlePostSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
        setPostText("")
        e.preventDefault()
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

    const handleDeadline = (e) => {
        setDatePicker(e.target.value)
        const formattedDate = new Date(e.target.value.replace(/-/g, "/"))
        const dateToUnix = Math.floor(new Date(formattedDate).getTime() / 1000)
        setDeadline(dateToUnix)
    }

    return (
        <div className="createPost">
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
                        className="postInput"
                    />
                </div>
                <div className="deadline">
                    <div className="setDeadline">Set Deadline</div>
                    <input
                        type="date"
                        id="deadline"
                        value={datePicker}
                        onChange={(e) => handleDeadline(e)}
                        className="datePicker mt-[10px]"
                    />
                    <button className="submitButton" onClick={(e) => createPost(e)}>
                        Post
                    </button>
                </div>
            </div>
        </div>
    )
}
