import { useEffect, useState, useMemo } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

const usePost = (postId) => {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const { runContractFunction } = useWeb3Contract()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const [postData, setPostData] = useState({
        postCreator: null,
        postText: "",
        deadline: 0,
        dateCreated: "",
        totalComments: 0,
        totalLikes: 0,
    })

    const handlePost = async (postId) => {
        const returnedPost = await runContractFunction({
            params: {
                abi: PostChain.abi,
                contractAddress: postChainAddress,
                functionName: "getPost",
                params: {
                    postId: postId,
                },
            },
            onError: (error) => {
                console.log("usePost.js -- error:", error)
            },
        })

        if (returnedPost) {
            setPostData({
                postCreator: returnedPost.creator,
                postText: returnedPost.post,
                deadline: parseInt(returnedPost.likeAndCommentDeadline),
                dateCreated: new Date(returnedPost.dateCreated * 1000),
                totalComments: parseInt(returnedPost.totalComments),
                totalLikes: parseInt(returnedPost.totalLikes),
            })
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handlePost(postId)
        }
    }, [isWeb3Enabled, postId])

    useEffect(() => {}, [setPostData])

    return { ...postData }
}

export { usePost }
