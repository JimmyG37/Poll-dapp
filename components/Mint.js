import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useNotification } from "@web3uikit/core"
import { useMintStatus } from "../hooks/useMintStatus"
import networkMapping from "../constants/networkMapping.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"

export default function Mint({ postId, postCreator, handleOpen }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainNftAddress = networkMapping[chainString].PostChainNft[0]
    const postChainNftAbi = PostChainNft.abi
    const isMinted = useMintStatus(postId)
    const { runContractFunction } = useWeb3Contract()
    const dispatch = useNotification()

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
            onSuccess: handleMintSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
    }

    const handleMintSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Post Minted!",
            title: "Success",
            position: "topR",
        })
    }

    useEffect(() => {}, [isWeb3Enabled, chainId, account, postId, postCreator])
    useEffect(() => {}, [isMinted])

    return (
        <div className="flex">
            {account === (postCreator || "").toLowerCase() ? (
                isMinted ? null : (
                    <button className="mintButton" onClick={() => handleMint()}>
                        Mint
                    </button>
                )
            ) : null}

            {isMinted ? (
                <div
                    className="mintVerified"
                    onClick={() => {
                        handleOpen()
                    }}
                >
                    <div className="ribbon">
                        <div className="innerRibbon"></div>
                    </div>
                    <div className="medal">
                        <svg
                            width="10"
                            height="10"
                            fill="#b17506"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M18.469 22.5a.75.75 0 0 1-.44-.14L12 17.99l-6.029 4.37a.75.75 0 0 1-1.15-.847l2.35-6.965-6.093-4.178A.75.75 0 0 1 1.5 9h7.518l2.268-6.981a.75.75 0 0 1 1.427 0l2.27 6.984H22.5a.75.75 0 0 1 .424 1.369l-6.096 4.176 2.35 6.963a.75.75 0 0 1-.71.99Z" />
                        </svg>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
