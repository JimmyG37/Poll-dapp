import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { useMoralis, useWeb3Contract, useChain } from "react-moralis"
import { ethers } from "ethers"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

export default function Balances() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const { chain } = useChain()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const { runContractFunction } = useWeb3Contract()
    const dispatch = useNotification()
    const [tipBalance, setTipBalance] = useState(0)
    const [chainName, setChainName] = useState("")

    const handleTipBalance = async () => {
        const returnedTipBalance = await runContractFunction({
            params: {
                abi: PostChain.abi,
                contractAddress: postChainAddress,
                functionName: "getTips",
                params: {
                    user: account,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedTipBalance) {
            setTipBalance(ethers.utils.formatEther(returnedTipBalance))
        }
    }
    const handleWithdrawSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "topR",
        })
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            handleTipBalance()
            setChainName(chain.name)
        }
    }, [isWeb3Enabled, account, tipBalance, dispatch])

    return (
        <div className="lg:inline ml-8 xl:w-[450px] py-3 space-y-5 sticky">
            <div className="text-[#d9d9d9] space-y-3 bg-[#15181c] pt-2 rounded-xl w-11/12 xl:w-9/12">
                <h4 className="font-bold text-xl px-4">Balances</h4>
                <div className=" px-4 py-2  flex items-center">
                    <div className="ml-4 leading-5 flex">
                        <h4 className="mr-2">Tips:</h4>
                        <h5 className="text-[15px]">{tipBalance}</h5>
                    </div>
                    {tipBalance != "0.0" ? (
                        <button
                            className="ml-auto bg-white text-black rounded font-bold text-sm py-1.5 px-3.5"
                            onClick={() => {
                                runContractFunction({
                                    params: {
                                        abi: PostChain.abi,
                                        contractAddress: postChainAddress,
                                        functionName: "withdrawBalances",
                                        params: {},
                                    },
                                    onError: (error) => console.log(error),
                                    onSuccess: handleWithdrawSuccess,
                                })
                            }}
                        >
                            Withdraw
                        </button>
                    ) : null}
                </div>
                <h4 className="text-[#6e767d] px-4">{chainName}</h4>
            </div>
        </div>
    )
}
