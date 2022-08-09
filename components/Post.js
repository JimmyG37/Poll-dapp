import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import networkMapping from "../constants/networkMapping.json"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import Moment from "react-moment"
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

const unixToDate = (u) => {
    let newDate = new Date(u * 1000)
    return newDate
}

export default function Post({ postIdentifier }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const [postCreator, setPostCreator] = useState(null)
    const [postText, setPostText] = useState("")
    const [commentDeadline, setCommentDeadline] = useState(0)
    const [likeDeadline, setLikeDeadline] = useState(0)
    const [dateCreated, setDateCreated] = useState(0)
    const [totalComments, setTotalComments] = useState(0)
    const [totalLikes, setTotalLikes] = useState(0)
    const postChainAbi = PostChain.abi
    const postId = parseInt(postIdentifier)
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
        }
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            handlePost()
        }
    }, [chainId, account, isWeb3Enabled])

    const formattedAddress = truncateStr(postCreator || "", 15)

    return (
        <div className="p-3 flex cursor-pointer border-b border-gray-700">
            <div className="flex justify-between">
                <div className="h-11 w-11 rounded-full mr-4">
                    <Jazzicon diameter={40} seed={jsNumberForAddress("" + postCreator)} />
                </div>
                <div className="flex flex-col space-y-2 w-full">
                    <div className="text-[#6e767d]">
                        <div className="inline-block group">
                            <h4 className="font-bold text-[13px] sm:text-base text-black group-hover:underline inline-block">
                                {formattedAddress}
                            </h4>
                        </div>
                        ·{" "}
                        <span className="hover:underline text-sm sm:text-[15px]">
                            <Moment fromNow>{dateCreated}</Moment>
                        </span>
                    </div>
                    <p className="text-black text-[15px] sm:text-base mt-0.5">{postText}</p>
                    <div className="flex justify-between w-8/12 ml-1">
                        <div className="icon">
                            <HeartIconFilled className="h-5 text-green-400" />
                        </div>
                        <div className="icon">
                            <ChatIconFilled className="h-5 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
