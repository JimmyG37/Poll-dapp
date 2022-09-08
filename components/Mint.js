import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useNotification } from "web3uikit"
import networkMapping from "../constants/networkMapping.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"

export default function Mint({ postId, postCreator }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainNftAddress = networkMapping[chainString].PostChainNft[0]
    const postChainNftAbi = PostChainNft.abi
    const { runContractFunction } = useWeb3Contract()
    const dispatch = useNotification()
    const [minted, setMinted] = useState(false)

    const handleMint = async () => {
        console.log("Mint.js -- postId:", postId)
        const mintOptions = {
            abi: postChainNftAbi,
            contractAddress: postChainNftAddress,
            functionName: "mintNft",
            params: {
                postId: postId,
            },
        }

        await runContractFunction({
            params: mintOptions,
            onSuccess: () => handleMintSuccess(),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    const handleMintSuccess = () => {
        setMinted(true)
        dispatch({
            type: "success",
            message: "Post Minted!",
            title: "Success",
            position: "topR",
        })
    }

    useEffect(() => {}, [isWeb3Enabled, account, postCreator, postId, minted])

    return (
        <div className="flex -ml-20 -mt-8">
            {account === (postCreator || "").toLowerCase() ? (
                minted ? (
                    <div className="pl-2 justify-items-center rounded-[15px] bg-[#f8fafc] w-8 font-bold shadow-md text-md md:text-[11px]">{`#${postId}`}</div>
                ) : (
                    <button
                        className="pl-1 justify-items-center rounded-[15px] bg-[#f8fafc] w-8 font-bold shadow-md hover:shadow-lg text-md md:text-[11px]"
                        onClick={() => handleMint()}
                    >
                        Mint
                    </button>
                )
            ) : null}
        </div>
    )
}
