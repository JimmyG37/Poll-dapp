import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

const useTipAmount = () => {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const [tipAmount, setTipAmount] = useState("")

    const { runContractFunction: getTipAmount } = useWeb3Contract({
        abi: PostChain.abi,
        contractAddress: postChainAddress,
        functionName: "getTipAmount",
        params: {},
    })

    const handleTipAmount = async () => {
        const returnedAmount = await getTipAmount()
        if (returnedAmount) {
            setTipAmount(returnedAmount.toString())
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handleTipAmount()
        }
    }, [isWeb3Enabled, tipAmount])

    return tipAmount
}

export { useTipAmount }
