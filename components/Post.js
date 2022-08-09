import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import networkMapping from "../constants/networkMapping.json"

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
            setPostCreator(returnedPost.creator)
            setCommentDeadline(parseInt(returnedPost.commentDeadline))
            setLikeDeadline(parseInt(returnedPost.likeDeadline))
            setPostText(returnedPost.post)
            setDateCreated(parseInt(returnedPost.dateCreated))
            setTotalComments(parseInt(returnedPost.totalComments))
            setTotalLikes(parseInt(returnedPost.totalLikes))
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handlePost()
        }
    }, [chainId, account, isWeb3Enabled])

    return <div className="p-3 flex cursor-pointer border-b border-gray-700">Hello</div>
}
