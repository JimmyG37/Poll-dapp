import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"

const useMintStatus = (postId) => {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainNftAddress = networkMapping[chainString].PostChainNft[0]
    const postChainNftAbi = PostChainNft.abi
    const [isMinted, setIsMinted] = useState(null)
    const { runContractFunction } = useWeb3Contract()

    const { runContractFunction: getMinted } = useWeb3Contract({
        abi: postChainNftAbi,
        contractAddress: postChainNftAddress,
        functionName: "getMinted",
        params: {
            postId: postId,
        },
    })

    const handleMintStatus = async () => {
        const mintStatus = await getMinted(postId)
        if (mintStatus) {
            setIsMinted(mintStatus)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handleMintStatus()
        }
    }, [isWeb3Enabled, postId, isMinted])

    return isMinted
}

export { useMintStatus }
