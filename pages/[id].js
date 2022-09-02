import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import Post from "../components/Post"
import GET_COMMENTS from "../constants/queryComments"
import Timer from "../components/Timer"
import Tip from "../components/Tip"
import Comment from "../components/Comment"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import Header from "../components/Header"
import { gql, useQuery } from "@apollo/client"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import { useMoralis, useWeb3Contract } from "react-moralis"
import ReplyToPost from "../components/ReplyToPost"

export default function PostPage() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const router = useRouter()
    const { id } = router.query
    const [totalLikes, setTotalLikes] = useState(0)
    const [tipAmount, setTipAmount] = useState(null)
    const [deadline, setDeadline] = useState(0)
    const [postCreator, setPostCreator] = useState(null)
    const { runContractFunction } = useWeb3Contract()
    const { loading, error, data } = useQuery(GET_COMMENTS)
    let postId = parseInt(id)

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
            setTotalLikes(parseInt(returnedPost.totalLikes))
            setDeadline(parseInt(returnedPost.likeAndCommentDeadline))
            setPostCreator(returnedPost.creator)
        }
    }

    const handleTipAmount = async () => {
        const returnedAmount = await runContractFunction({
            params: {
                abi: PostChain.abi,
                contractAddress: postChainAddress,
                functionName: "getTipAmount",
            },
            onError: (error) => console.log(error),
        })

        if (returnedAmount) {
            setTipAmount(returnedAmount.toNumber())
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handlePost()
            handleTipAmount()
        }
    }, [isWeb3Enabled])

    return (
        <div>
            <Header />
            <div className="bg-slate-50 min-h-screen flex max-w-[1500px] mx-auto">
                <Sidebar />
                <div className="flex-grow border-l border-r border-gray-200 max-w-2xl sm:ml-[73px] xl:ml-[370px]">
                    <div className="flex items-center px-1.5 py-2 border-b border-gray-200 text-black font-semibold text-xl gap-x-4 sticky top-0 z-50 bg-slate-50">
                        <div
                            className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0"
                            onClick={() => router.push("/")}
                        >
                            <ArrowLeftIcon className="h-5 text-black" />
                        </div>
                        Post
                    </div>
                    <Post id={id} postPage />
                    <div className="flex items-center px-1.5 py-2 border-b border-gray-200 text-[#62676b] gap-x-1 sticky top-0 z-50 bg-slate-50">
                        <span className="ml-5 text-sm sm:text-[14px]">{totalLikes}</span>{" "}
                        {totalLikes > 2 || totalLikes == 0 ? (
                            <span className=" text-sm sm:text-[13px] text-[#6e767d]">Likes</span>
                        ) : (
                            <span className=" text-sm sm:text-[13px] text-[#595b5f]">Like</span>
                        )}
                        <div className="ml-10">
                            <Tip postCreator={postCreator} tipAmount={tipAmount} />
                        </div>
                        <div className="ml-10">
                            <Timer deadline={deadline} />
                        </div>
                    </div>
                    {isWeb3Enabled ? (
                        loading || !data ? (
                            <div>Loading...</div>
                        ) : (
                            <div className="pb-72">
                                <ReplyToPost id={id} />
                                {data.comments.length > 0 &&
                                    data.comments.map((comment) => {
                                        if (comment.postId == id) {
                                            return (
                                                <Comment
                                                    key={`${comment.id}${comment.commentId}`}
                                                    id={comment.commentId}
                                                    tipAmount={tipAmount}
                                                />
                                            )
                                        }
                                    })}
                            </div>
                        )
                    ) : (
                        <div>Web3 Not Enabled</div>
                    )}
                </div>
            </div>
        </div>
    )
}
