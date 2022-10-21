import React, { useEffect, useState, useContext, useCallback } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import Moment from "react-moment"
import Tip from "./Tip"
import { Tooltip } from "@web3uikit/core"
import CountdownTimer from "./CountdownTimer"
import { usePost } from "../hooks/usePost"
import { useTruncate } from "../hooks/useTruncate"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import Calendar from "./Calendar"
import { useMintStatus } from "../hooks/useMintStatus"
import { useOwnerOf } from "../hooks/useOwnerOf"
import { Mint } from "./Mint"
import { useTokenURI } from "../hooks/useTokenURI"
import Image from "next/image"
import { PostContext } from "../hooks/PostContext"
import { ActiveItem } from "./ActiveItem"
import ListedNft from "./ListedNft"

export const Post = React.memo(({ postId, tipAmount, showComments }) => {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const { postCreator, postText, deadline, totalComments, dateCreated, totalLikes } =
        usePost(postId)
    const { post, setPost } = useContext(PostContext)
    const isMinted = useMintStatus(postId)
    const imageURI = useTokenURI(postId, isMinted)
    const nftOwner = useOwnerOf(postId, isMinted)
    const formattedAddress = useTruncate(postCreator || "", 15)
    const [isOpen, setIsOpen] = useState(false)

    const topDoor = isOpen ? "top-[-50%] doorShadow" : "topslide before:top-[5px]"
    const bottomDoor = isOpen ? "top-[100%] doorShadow" : "bottomslide before:top-[-20px]"

    const lockStatus = new Date(deadline * 1000) <= new Date() ? "lock" : "unlocked"

    const showNft = imageURI && (
        <Image loader={() => imageURI} src={imageURI} height="150" width="300" />
    )

    const owner = account.toLowerCase() == nftOwner.toLowerCase() ? "you" : nftOwner

    const buyOptions =
        isMinted && imageURI ? <ActiveItem tokenId={postId} imageURI={imageURI} /> : null

    const showCase = useCallback(() => {
        setIsOpen((isOpen) => !isOpen)
    }, [setIsOpen])

    const mint =
        new Date(deadline * 1000) <= new Date() ? (
            <Mint
                postId={postId}
                postCreator={postCreator}
                isMinted={isMinted}
                showCase={showCase}
            />
        ) : null

    useEffect(() => {}, [account, postId, isOpen])

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
            <div className="flex flex-col gap-4 items-center justify-center">
                <div className="nftContainer">
                    {showNft}
                    {buyOptions}
                </div>
                <div className="italic text-sm text-white">Owned by {owner}</div>
            </div>
        </div>
    )
})
