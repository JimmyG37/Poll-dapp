import Moment from "react-moment"
import Mint from "./Mint"
import Tip from "./Tip"
import { Tooltip } from "@web3uikit/core"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useEffect, useState, useContext } from "react"
import { useRouter } from "next/router"
import { useTruncate } from "../hooks/useTruncate"
import { useMoralis, useWeb3Contract } from "react-moralis"
import Image from "next/image"
import ChatBubble from "./ChatBubble"
import Calendar from "./Calendar"
import CountdownTimer from "./CountdownTimer"
import { useTokenURI } from "../hooks/useTokenURI"
import { usePost } from "../hooks/usePost"
import { useMintStatus } from "../hooks/useMintStatus"
import { PostContext } from "../hooks/PostContext"

export default function Post({ postId, tipAmount, showComments }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const [postCreator, postText, deadline, totalComments, dateCreated, totalLikes] =
        usePost(postId)
    const { post, setPost } = useContext(PostContext)
    // const [imageURI] = useTokenURI(postId)
    const isMinted = useMintStatus(postId)
    const formattedAddress = useTruncate(postCreator || "", 15)
    const [isOpen, setIsOpen] = useState(false)

    const topDoor = isOpen ? "top-[-50%] doorShadow" : "topslide before:top-[5px]"
    const bottomDoor = isOpen ? "top-[100%] doorShadow" : "bottomslide before:top-[-20px]"

    const mint =
        dateCreated > new Date() ? <Mint postId={postId} postCreator={postCreator} /> : null

    const lockStatus = new Date(deadline * 1000) <= new Date() ? "lock" : "unlocked"
    // const showNft = isMinted && imageURI ? <Image src={imageURI} height="150" width="300" /> : null

    useEffect(() => {}, [
        isWeb3Enabled,
        postId,
        postCreator,
        postText,
        deadline,
        totalComments,
        dateCreated,
        totalLikes,
    ])

    useEffect(() => {}, [isMinted, post])

    return (
        <div className="trapdoor w-full">
            <div className={`flex w-max h-[50%] absolute door ${topDoor}`}>
                <div className="flex w-full pl-4 pt-5">
                    <div className="pfpContainer w-[3.1rem] h-[3.0rem] z-10">
                        <Jazzicon diameter={80} seed={jsNumberForAddress("" + postCreator)} />
                    </div>
                    <div className="h-4 w-25 items-center justify-center z-3  mt-8 -ml-4">
                        <h4
                            className="addressBar"
                            style={{
                                border: "1px solid rgba(0,0,0,0.25)",
                                borderTop: "2px solid #1d9bf0",
                            }}
                        >
                            {formattedAddress}
                        </h4>
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                setIsOpen(!isOpen)
                            }}
                        >
                            {mint}
                        </div>
                    </div>
                </div>
                <Calendar className="order-last" deadline={deadline} />
            </div>
            <div className={`w-[100%] h-[50%] absolute door pl-4 ${bottomDoor}`}>
                <p className="text-white text-[15px] sm:text-base pt-1">{postText}</p>
                <div className="flex flex-row pt-6">
                    <div
                        className="pr-6 cursor-pointer"
                        onClick={() => {
                            showComments()
                            setPost({
                                postId: postId,
                                totalLikes: totalLikes,
                                deadline: deadline,
                                totalComments: totalComments,
                            })
                        }}
                    >
                        <div className={`${lockStatus}`}>
                            <div className="speech-bubble drop-shadow-2xl"></div>
                        </div>
                    </div>
                    <Tooltip content="Tip" position="right">
                        <Tip postCreator={postCreator} tipAmount={tipAmount} />
                    </Tooltip>
                </div>
            </div>
            {/* <div className="flex pl-5 items-center justify-center">{showNft}</div> */}
        </div>
    )
}
