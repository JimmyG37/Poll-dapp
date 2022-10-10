import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

const useComment = (commentId, totalLikes) => {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const [commenter, setCommenter] = useState(null)
    const [comment, setComment] = useState("")
    const [timeCreated, setTimeCreated] = useState(0)
    const [commentLikes, setCommentLikes] = useState(0)
    const [likePercent, setLikePercent] = useState(0)
    const { runContractFunction } = useWeb3Contract()

    const handleComment = async () => {
        const returnedComment = await runContractFunction({
            params: {
                abi: PostChain.abi,
                contractAddress: postChainAddress,
                functionName: "getComment",
                params: {
                    commentId: commentId,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedComment) {
            setCommenter(returnedComment.commenter)
            setComment(returnedComment.comment)
            setTimeCreated(new Date(returnedComment.timeCreated * 1000))
            setCommentLikes(parseInt(returnedComment.likes))
            setLikePercent(Math.floor(calculatePercent(commentLikes, totalLikes)))
        }
    }

    const calculatePercent = (partialValue, totalValue) => {
        return (100 * partialValue) / totalValue
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handleComment()
        }
    }, [
        isWeb3Enabled,
        commentId,
        totalLikes,
        commenter,
        comment,
        timeCreated,
        commentLikes,
        likePercent,
    ])

    return [commenter, comment, timeCreated, commentLikes, likePercent]
}

export { useComment }
