import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"
import { useMintStatus } from "./useMintStatus"

const useTokenURI = (postId) => {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainNftAddress = networkMapping[chainString].PostChainNft[0]
    const postChainNftAbi = PostChainNft.abi
    const isMinted = useMintStatus(postId)
    const { runContractFunction } = useWeb3Contract()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: postChainNftAbi,
        contractAddress: postChainNftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: postId,
        },
    })

    const handleTokenURI = async () => {
        const tokenURI = await getTokenURI()
        if (tokenURI) {
            const tokenData = tokenURI.replace("data:application/json;base64,", "")
            const decodedTokenData = atob(tokenData)
            const jsonManifest = JSON.parse(decodedTokenData)
            const { name, description, image } = jsonManifest
            setImageURI(image)
            setTokenName(name)
            setTokenDescription(description)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled && isMinted) {
            handleTokenURI()
        }
    }, [isWeb3Enabled, postId, isMinted, imageURI, tokenName, tokenDescription])

    return [imageURI, tokenName, tokenDescription]
}

export { useTokenURI }
