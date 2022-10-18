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
                    <button
                        className="pl-1 flex justify-items items-center-center rounded-[15px] bg-[#f8fafc] w-8 py-[0.5px] font-bold shadow-md hover:shadow-lg text-md md:text-[11px]"
                        onClick={() => handleMint()}
                    >
                        Mint
                    </button>
                )
            ) : null}

            {isMinted ? (
                <div
                    className="ml-2 flex flex-col justify-center items-center cursor-pointer"
                    onClick={() => {
                        handleOpen()
                    }}
                >
                    <div className="w-4 h-3 bg-[#F07C00] flex justify-center items-center rounded-b-[2px]">
                        <div className="w-[6px] h-2 bg-[#BF4800]"></div>
                    </div>
                    <div className="mt-[-1px] rounded-full bg-[#EEC600] h-4 w-4 flex justify-center items-center">
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
