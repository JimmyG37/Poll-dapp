import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"

const useTokenURI = (postId, isMinted) => {
    const { chainId, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainNftAddress = networkMapping[chainString].PostChainNft[0]
    const postChainNftAbi = PostChainNft.abi
    const { runContractFunction } = useWeb3Contract()
    const [imageURI, setImageURI] = useState("")

    const handleTokenURI = async (postId) => {
        const tokenURI = await runContractFunction({
            params: {
                abi: postChainNftAbi,
                contractAddress: postChainNftAddress,
                functionName: "tokenURI",
                params: {
                    tokenId: postId,
                },
            },
            onError: (error) => {
                console.log("useTokenURI.js -- tokenURI:", error)
            },
        })

        if (tokenURI) {
            const tokenData = tokenURI.replace("data:application/json;base64,", "")
            const decodedTokenData = atob(tokenData)
            const jsonManifest = JSON.parse(decodedTokenData)
            const { name, description, image } = jsonManifest
            setImageURI(image)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled && isMinted) {
            handleTokenURI(postId)
        }
    }, [isWeb3Enabled, postId, isMinted])

    useEffect(() => {}, [setImageURI])

    return imageURI
}

export { useTokenURI }
