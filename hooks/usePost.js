import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

const usePost = (postId) => {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const [postCreator, setPostCreator] = useState(null)
    const [postText, setPostText] = useState("")
    const [deadline, setDeadline] = useState(0)
    const [dateCreated, setDateCreated] = useState(0)
    const [totalComments, setTotalComments] = useState(0)
    const [totalLikes, setTotalLikes] = useState(0)

    const { runContractFunction: getPost } = useWeb3Contract({
        abi: PostChain.abi,
        contractAddress: postChainAddress,
        functionName: "getPost",
        params: {
            postId: postId,
        },
    })

    const handlePost = async () => {
        const returnedPost = await getPost()

        if (returnedPost) {
            setPostCreator(returnedPost.creator)
            setPostText(returnedPost.post)
            setDeadline(parseInt(returnedPost.likeAndCommentDeadline))
            setTotalComments(parseInt(returnedPost.totalComments))
            setDateCreated(new Date(returnedPost.dateCreated * 1000))
            setTotalLikes(parseInt(returnedPost.totalLikes))
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handlePost()
        }
    }, [
        isWeb3Enabled,
        postId,
        postCreator,
        postText,
        deadline,
        totalComments,
        dateCreated,
        totalLikes,
    ])

    return [postCreator, postText, deadline, totalComments, dateCreated, totalLikes]
}

export { usePost }
