import { useEffect, useState } from "react"
import { useNotification } from "@web3uikit/core"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { CurrencyDollarIcon } from "@heroicons/react/24/outline"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

export default function Tip({ postCreator, tipAmount }) {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const { runContractFunction } = useWeb3Contract()
    const dispatch = useNotification()

    const handleTip = async (postCreator) => {
        const tipOptions = {
            abi: postChainAbi,
            contractAddress: postChainAddress,
            functionName: "tipUser",
            msgValue: tipAmount,
            params: {
                userAddress: postCreator,
            },
        }

        await runContractFunction({
            params: tipOptions,
            onSuccess: () => handleTipSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
    }

    const handleTipSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Tip Sent!",
            title: "Success",
            position: "topR",
        })
    }

    return (
        <div
            className="flex h-4 w-4 justify-center items-center cursor-pointer  hover:animate-spinning border-[#ffa500] bg-[#ffa500]  rounded-full"
            onClick={() => handleTip(postCreator)}
        >
            <div className="h-3 w-3 rounded-full bg-[#e09100] shadow-inner flex justify-center items-center">
                <div className="h-[6px] w-0.5 bg-[#e09100] shadow-[inset_33px_33px_0px_#ba7800]"></div>
            </div>
        </div>
    )
}
