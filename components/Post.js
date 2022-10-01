import Moment from "react-moment"
import Mint from "./Mint"
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
import { usePost } from "../hooks/usePost"
import { useTipAmount } from "../hooks/useTipAmount"
import { useMintStatus } from "../hooks/useMintStatus"

export default function Post({ postId, postPage }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const [postCreator, postText, deadline, totalComments, dateCreated, totalLikes] =
        usePost(postId)
    const tipAmount = useTipAmount()
    const [imageURI] = useTokenURI(postId)
    const isMinted = useMintStatus(postId)
    const formattedAddress = useTruncate(postCreator || "", 15)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const topDoor = isOpen ? "top-[-50%] doorShadow" : "topslide before:top-[5px]"
    const bottomDoor = isOpen ? "top-[100%] doorShadow" : "bottomslide before:top-[-20px]"

    const mint =
        dateCreated < new Date() ? <Mint postId={postId} postCreator={postCreator} /> : null

    const showNft = isMinted && imageURI ? <Image src={imageURI} height="150" width="300" /> : null

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

    useEffect(() => {}, [isMinted])

    return (
        <div className="trapdoor w-full">
            <div className={`flex w-max h-[50%] absolute door ${topDoor}`}>
                <div className="flex w-full pl-4 pt-5  ">
                    <div className="pfpContainer w-[3.1rem] h-[3.0rem] z-10">
                        <Jazzicon diameter={80} seed={jsNumberForAddress("" + postCreator)} />
                    </div>
                    <div className="h-4 w-25 items-center justify-center z-3  mt-8 -ml-4">
                        <h4 className="addressBar opacity-[2] border-[#1d9bf0] ">
                            {formattedAddress}
                        </h4>
                        <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                            {mint}
                        </div>
                    </div>
                </div>
                <Calendar className="order-last" deadline={deadline} />
            </div>
            <div>
                <div className={`w-[100%] h-[50%] absolute door pl-4 ${bottomDoor}`}>
                    <p className="text-black text-[15px] sm:text-base pt-1">{postText}</p>
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
            <div className="flex pl-5 items-center justify-center">{showNft}</div>
            {postPage && (
                <div className="flex items-center justify-center py-2 border-b border-gray-200">
                    <CountdownTimer deadline={deadline} />
                </div>
            )}
        </div>
    )
}
