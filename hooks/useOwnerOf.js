import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"

const useOwnerOf = (postId, isMinted) => {
    const { chainId, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainNftAddress = networkMapping[chainString].PostChainNft[0]
    const postChainNftAbi = PostChainNft.abi
    const { runContractFunction } = useWeb3Contract()
    const [nftOwner, setNftOwner] = useState("")

    const handleNftOwner = async (postId) => {
        const ownerAddress = await runContractFunction({
            params: {
                abi: postChainNftAbi,
                contractAddress: postChainNftAddress,
                functionName: "ownerOf",
                params: {
                    tokenId: postId,
                },
            },
            onError: (error) => {
                console.log("useOwnerOf.js -- ownerAddress:", error)
            },
        })

        setNftOwner(ownerAddress)
    }

    useEffect(() => {
        if (isWeb3Enabled && isMinted) {
            handleNftOwner(postId)
        }
    }, [isWeb3Enabled, postId, isMinted])

    useEffect(() => {}, [setNftOwner])

    return nftOwner
}

export { useOwnerOf }
