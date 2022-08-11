import Moment from "react-moment"
import moment from "moment"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import { Tooltip } from "web3uikit"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { CountdownCircleTimer } from "react-countdown-circle-timer"
import { HeartIcon as HeartIconFilled, ChatIcon as ChatIconFilled } from "@heroicons/react/solid"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const seperator = "..."
    let seperatorLength = seperator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 3)
    return (
        fullStr.substring(0, frontChars) + seperator + fullStr.substring(fullStr.length - backChars)
    )
}

export default function Post({ id, postPage }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const [postCreator, setPostCreator] = useState(null)
    const [postText, setPostText] = useState("")
    const [commentDeadline, setCommentDeadline] = useState(0)
    const [likeDeadline, setLikeDeadline] = useState(0)
    const [dateCreated, setDateCreated] = useState(0)
    const [totalComments, setTotalComments] = useState(0)
    const [totalLikes, setTotalLikes] = useState(0)
    const [commentSeconds, setCommentSeconds] = useState(0)
    const [likeSeconds, setLikeSeconds] = useState(0)
    const [postPageDate, setPostPageDate] = useState(null)
    const postId = parseInt(id)
    const router = useRouter()
    const { runContractFunction } = useWeb3Contract()

    async function handlePost() {
        const returnedPost = await runContractFunction({
            params: {
                abi: PostChain.abi,
                contractAddress: postChainAddress,
                functionName: "getPost",
                params: {
                    postId: postId,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedPost) {
            let createdDate = unixToDate(returnedPost.dateCreated)
            setPostCreator(returnedPost.creator)
            setCommentDeadline(parseInt(returnedPost.commentDeadline))
            setLikeDeadline(parseInt(returnedPost.likeDeadline))
            setPostText(returnedPost.post)
            setDateCreated(createdDate)
            setTotalComments(parseInt(returnedPost.totalComments))
            setTotalLikes(parseInt(returnedPost.totalLikes))
            unixToSeconds(commentDeadline, likeDeadline)
        }
    }

    const unixToSeconds = (comment, like) => {
        let commentDate = new Date(comment * 1000)
        let currentCommentDate = new Date()
        let likeDate = new Date(like * 1000)
        let currentLikeDate = new Date()

        let commentDateDiff = commentDate.getTime() - currentCommentDate.getTime()
        let likeDateDiff = likeDate.getTime() - currentLikeDate.getTime()

        let commentSecDiff = commentDateDiff / 1000
        let likeSecDiff = likeDateDiff / 1000
        var newCommentSeconds = Math.abs(commentSecDiff)
        var newLikeSeconds = Math.abs(likeSecDiff)
        setCommentSeconds(newCommentSeconds)
        setLikeSeconds(newLikeSeconds)
    }

    const unixToDate = (u) => {
        let newDate = new Date(u * 1000)
        setPostPageDate(newDate)
        return newDate
    }

    const timeRemaining = (remainingTime) => {
        const hours = Math.floor(remainingTime / 3600)
        const minutes = Math.floor((remainingTime % 3600) / 60)
        const seconds = remainingTime % 60

        return `${hours}hrs:${minutes}mins:${seconds}secs`
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handlePost()
        }
    }, [chainId, account, isWeb3Enabled, commentSeconds, likeSeconds])

    const formattedAddress = truncateStr(postCreator || "", 15)
    return (
        <div
            className="p-2 flex cursor-pointer border-b border-gray-200"
            onClick={() => router.push(`/${id}`)}
        >
            <div className="h-11 w-11 rounded-full mr-4">
                <Jazzicon diameter={40} seed={jsNumberForAddress("" + postCreator)} />
            </div>
            <div className="flex justify-between">
                <div className="flex flex-col space-y-2 w-full">
                    <div className="text-[#6e767d]">
                        <div className="inline-block group">
                            <h4 className="font-bold text-[13px] sm:text-base text-black group-hover:underline inline-block">
                                {formattedAddress}
                            </h4>
                        </div>{" "}
                        {!postPage && (
                            <span className="text-sm sm:text-[15px]">
                                · <Moment fromNow>{dateCreated}</Moment>
                            </span>
                        )}
                    </div>
                    <p className="text-black text-[15px] sm:text-base mt-0.5">{postText}</p>
                    {!postPage && (
                        <div className="flex justify-between w-8/12 ml-1">
                            <div className="icon">
                                <CountdownCircleTimer
                                    isPlaying
                                    duration={likeSeconds}
                                    colors="#90EE90"
                                    colorsTime={[1, 1, 2, 0]}
                                    strokeWidth={5}
                                    size={36}
                                >
                                    {({ remainingTime }) => (
                                        <div>
                                            <Tooltip
                                                content={`${timeRemaining(
                                                    remainingTime
                                                )} to like a comment`}
                                                position="left"
                                            >
                                                <HeartIconFilled className="h-5 text-green-400" />
                                            </Tooltip>
                                        </div>
                                    )}
                                </CountdownCircleTimer>
                            </div>
                            <div className="icon">
                                <CountdownCircleTimer
                                    isPlaying
                                    duration={commentSeconds}
                                    colors="#90EE90"
                                    colorsTime={[7, 5, 2, 0]}
                                    strokeWidth={5}
                                    size={36}
                                >
                                    {({ remainingTime }) => (
                                        <div>
                                            <Tooltip
                                                content={`${timeRemaining(
                                                    remainingTime
                                                )} to reply to post`}
                                                position="right"
                                            >
                                                <ChatIconFilled className="h-5 text-green-400" />
                                            </Tooltip>
                                        </div>
                                    )}
                                </CountdownCircleTimer>
                            </div>
                        </div>
                    )}
                    {postPage && (
                        <span className="text-sm sm:text-[15px] text-[#6e767d]">
                            <Moment format="h:mm A">{postPageDate}</Moment> ·{" "}
                            <Moment format="MMM DD, YY">{postPageDate}</Moment>
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
