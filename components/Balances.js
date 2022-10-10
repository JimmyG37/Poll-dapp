import { useEffect, useState } from "react"
import { useNotification } from "@web3uikit/core"
import { useMoralis, useWeb3Contract, useChain } from "react-moralis"
import { ethers } from "ethers"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import PostChainMarket from "../artifacts/contracts/PostChainMarket.sol/PostChainMarket.json"

export default function Balances() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const { chain } = useChain()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const postChainAbi = PostChain.abi
    const marketAddress = networkMapping[chainString].PostChainMarket[0]
    const postChainMarketAbi = PostChainMarket.abi
    const { runContractFunction } = useWeb3Contract()
    const dispatch = useNotification()
    const [tipBalance, setTipBalance] = useState(0.0)
    const [proceedsBalance, setProceedsBalance] = useState(0.0)
    const [royaltyBalance, setRoyaltyBalance] = useState(0.0)
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
            message: "Withdrawing funds",
            position: "topR",
        })
    }

    const handleProceedsBalance = async () => {
        const returnedProceedsBalance = await runContractFunction({
            params: {
                abi: PostChainMarket.abi,
                contractAddress: marketAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedProceedsBalance) {
            setProceedsBalance(ethers.utils.formatEther(returnedProceedsBalance))
        }
    }

    const handleRoyaltyBalance = async () => {
        const returnedRoyaltyBalance = await runContractFunction({
            params: {
                abi: PostChainMarket.abi,
                contractAddress: marketAddress,
                functionName: "getRoyalties",
                params: {
                    nftCreator: account,
                },
            },
            onError: (error) => console.log(error),
        })
        if (returnedRoyaltyBalance) {
            setRoyaltyBalance(ethers.utils.formatEther(returnedRoyaltyBalance))
        }
    }

    useEffect(() => {
        if (chain && isWeb3Enabled) {
            handleTipBalance()
            setChainName(chain.name)
        }
    }, [isWeb3Enabled, chain, account, tipBalance])

    useEffect(() => {
        if (isWeb3Enabled) {
            handleProceedsBalance()
            handleRoyaltyBalance()
        }
    }, [isWeb3Enabled, proceedsBalance, royaltyBalance])

    return (
        <div className="hidden lg:inline ml-[68rem] mt-[3rem] xl:w-[430px] py-1 space-y-5 fixed ">
            <div className="text-[#d9d9d9] space-y-3 balanceContainer pt-2 rounded-xl w-11/12 xl:w-9/12">
                <div className="fundsContainer">
                    <h4 className="font-bold text-xl px-4">Balances</h4>
                    <div className="relative flex ml-auto py-1.5 px-3.5">
                        {tipBalance != "0.0" ? (
                            <div className="animate-spinning">
                                <div className="coinContainer animate-bounce">
                                    <div className="innerCoinContainer">
                                        <div className="coinCenter"></div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {proceedsBalance != "0.0" ? (
                            <div className="animate-spinning px-1">
                                <div className="coinContainer animate-bounce">
                                    <div className="innerCoinContainer">
                                        <div className="coinCenter"></div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {royaltyBalance != "0.0" ? (
                            <div className="animate-spinning">
                                <div className="coinContainer animate-bounce">
                                    <div className="innerCoinContainer">
                                        <div className="coinCenter"></div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {tipBalance != "0.0" ? (
                    <div className="fundsContainer">
                        <div className="ml-4 leading-5 flex">
                            <h4 className="mr-2">Tips:</h4>
                            <h5 className="text-[15px]">{tipBalance}</h5>
                        </div>
                        <button
                            className="withdrawButton"
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
                    </div>
                ) : (
                    <div className="text-[#848D94] fundsContainer">
                        <div className="ml-4 leading-5 flex ">
                            <h4 className="mr-2">Tips:</h4>
                            <h5 className="text-[15px]">{tipBalance}</h5>
                        </div>
                        <div className="grayedOutWithdraw">Withdraw</div>
                    </div>
                )}

                {proceedsBalance != "0.0" ? (
                    <div className="fundsContainer">
                        <div className="ml-4 leading-5 flex">
                            <h4 className="mr-2">Proceeds:</h4>
                            <h5 className="text-[15px]">{proceedsBalance}</h5>
                        </div>
                        <button
                            className="withdrawButton"
                            onClick={() => {
                                runContractFunction({
                                    params: {
                                        abi: PostChainMarket.abi,
                                        contractAddress: marketAddress,
                                        functionName: "withdrawProceeds",
                                        params: {},
                                    },
                                    onError: (error) => console.log(error),
                                    onSuccess: handleWithdrawSuccess,
                                })
                            }}
                        >
                            Withdraw
                        </button>
                    </div>
                ) : (
                    <div className="text-[#848D94] fundsContainer">
                        <div className="ml-4 leading-5 flex">
                            <h4 className="mr-2">Proceeds:</h4>
                            <h5 className="text-[15px]">{proceedsBalance}</h5>
                        </div>
                        <div className="grayedOutWithdraw">Withdraw</div>
                    </div>
                )}

                {royaltyBalance != "0.0" ? (
                    <div className="fundsContainer">
                        <div className="ml-4 leading-5 flex">
                            <h4 className="mr-2">Royalties:</h4>
                            <h5 className="text-[15px]">{royaltyBalance}</h5>
                        </div>
                        <button
                            className="withdrawButton"
                            onClick={() => {
                                runContractFunction({
                                    params: {
                                        abi: PostChainMarket.abi,
                                        contractAddress: marketAddress,
                                        functionName: "withdrawRoyalties",
                                        params: {},
                                    },
                                    onError: (error) => console.log(error),
                                    onSuccess: handleWithdrawSuccess,
                                })
                            }}
                        >
                            Withdraw
                        </button>
                    </div>
                ) : (
                    <div className="text-[#848D94] fundsContainer">
                        <div className="ml-4 leading-5 flex">
                            <h4 className="mr-2">Royalties:</h4>
                            <h5 className="text-[15px]">{royaltyBalance}</h5>
                        </div>
                        <div className="grayedOutWithdraw">Withdraw</div>
                    </div>
                )}

                <h4 className="text-[#6e767d] px-4">{chainName}</h4>
            </div>
        </div>
    )
}
