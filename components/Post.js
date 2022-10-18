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
import Calendar from "./Calendar"
import CountdownTimer from "./CountdownTimer"
import { useTokenURI } from "../hooks/useTokenURI"
import { usePost } from "../hooks/usePost"
import { useMintStatus } from "../hooks/useMintStatus"
import { PostContext } from "../hooks/PostContext"
import ActiveItem from "./ActiveItem"
import ListedNft from "./ListedNft"

export default function Post({ postId, tipAmount, showComments }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const [postCreator, postText, deadline, totalComments, dateCreated, totalLikes] =
        usePost(postId)
    const { post, setPost } = useContext(PostContext)
    const isMinted = useMintStatus(postId)
    const [imageURI] = useTokenURI(postId)
    const formattedAddress = useTruncate(postCreator || "", 15)
    const [isOpen, setIsOpen] = useState(false)

    const topDoor = isOpen ? "top-[-50%] doorShadow" : "topslide before:top-[5px]"
    const bottomDoor = isOpen ? "top-[100%] doorShadow" : "bottomslide before:top-[-20px]"

    const handleOpen = () => {
        setIsOpen(!isOpen)
    }

    const mint =
        new Date(deadline * 1000) <= new Date() ? (
            <Mint postId={postId} postCreator={postCreator} handleOpen={handleOpen} />
        ) : null

    const lockStatus = new Date(deadline * 1000) <= new Date() ? "lock" : "unlocked"

    const showNft = imageURI && <Image src={imageURI} height="150" width="300" />

    const buyOptions =
        isMinted && imageURI ? <ActiveItem tokenId={postId} imageURI={imageURI} /> : null

    useEffect(() => {}, [
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
            <div className={`postTop door ${topDoor}`}>
                <div className="postHeader">
                    <div className="pfpContainer w-[3.1rem] h-[3.0rem] z-10">
                        <Jazzicon diameter={80} seed={jsNumberForAddress("" + postCreator)} />
                    </div>
                    <div className="postInfo">
                        <h4
                            className="addressBar"
                            style={{
                                border: "1px solid rgba(0,0,0,0.25)",
                                borderTop: "2px solid #1d9bf0",
                            }}
                        >
                            {formattedAddress}
                        </h4>
                        <div className="flex">
                            {mint}
                            <span className="postId">{postId}</span>
                        </div>
                    </div>
                </div>
                <Calendar className="order-last" deadline={deadline} />
            </div>
            <div className={`postBottom door ${bottomDoor}`}>
                <p className="postText">{postText}</p>
                <div className="postFooter">
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
                            <div className="speech-bubble"></div>
                        </div>
                    </div>
                    <Tooltip content="Tip" position="right">
                        <Tip postCreator={postCreator} tipAmount={tipAmount} />
                    </Tooltip>
                </div>
            </div>
            <div className="nftContainer">
                {showNft}
                {buyOptions}
            </div>
        </div>
    )
}
