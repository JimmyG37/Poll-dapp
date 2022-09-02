import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
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
        <div className="flex cursor-pointer" onClick={() => handleTip(postCreator)}>
            <CurrencyDollarIcon className="h-7 pl-5 pb-1.4 pr-4 text-[#218380]" />
            <div className="text-[#6e767d] text-sm sm:text-[14px] pt-0.5">Tip</div>
        </div>
    )
}
