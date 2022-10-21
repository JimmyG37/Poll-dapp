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

    const handleTipBalance = async (account) => {
        const returnedTipBalance = await runContractFunction({
            params: {
                abi: PostChain.abi,
                contractAddress: postChainAddress,
                functionName: "getTips",
                params: {
                    user: account,
                },
            },
            onSuccess: () => handleProceedsBalance(account),
            onError: (error) => console.log("Balances.js -- TipBalance:", error),
        })
        if (returnedTipBalance) {
            setTipBalance(ethers.utils.formatEther(returnedTipBalance))
        }
    }

    const handleProceedsBalance = async (account) => {
        const returnedProceedsBalance = await runContractFunction({
            params: {
                abi: PostChainMarket.abi,
                contractAddress: marketAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
            },
            onSuccess: () => handleRoyaltyBalance(account),
            onError: (error) => console.log("Balances.js -- ProceedsBalance:", error),
        })
        if (returnedProceedsBalance) {
            setProceedsBalance(ethers.utils.formatEther(returnedProceedsBalance))
        }
    }

    const handleRoyaltyBalance = async (account) => {
        const returnedRoyaltyBalance = await runContractFunction({
            params: {
                abi: PostChainMarket.abi,
                contractAddress: marketAddress,
                functionName: "getRoyalties",
                params: {
                    nftCreator: account,
                },
            },
            onError: (error) => console.log("Balances.js -- RoyaltyBalance:", error),
        })
        if (returnedRoyaltyBalance) {
            setRoyaltyBalance(ethers.utils.formatEther(returnedRoyaltyBalance))
        }
    }

    const handleWithdrawTipsSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Tips Withdrawn",
            position: "topR",
        })
        setTipBalance(0.0)
    }

    const handleWithdrawProceedsSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Proceeds Withdrawn",
            position: "topR",
        })
        setProceedsBalance(0.0)
    }

    const handleWithdrawRoyaltiesSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Royalties Withdrawn",
            position: "topR",
        })
        setRoyaltyBalance(0.0)
    }

    useEffect(() => {
        if (chain) {
            setChainName(chain.name)
        }
    }, [chain])

    useEffect(() => {
        if (isWeb3Enabled) {
            handleTipBalance(account)
        }
    }, [isWeb3Enabled, account, tipBalance, proceedsBalance, royaltyBalance])

    return (
        <div className="widgetContainer widget">
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
                                onError: (error) =>
                                    console.log("Balances.js -- Withdraw Tips:", error),
                                onSuccess: handleWithdrawTipsSuccess,
                            })
                        }}
                    >
                        Withdraw
                    </button>
                </div>
            ) : (
                <div className="fundsContainer">
                    <div className="ml-4 leading-5 flex text-[#9ca3af]">
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
                                onError: (error) =>
                                    console.log("Balances.js -- Withdraw Proceeds:", error),
                                onSuccess: handleWithdrawProceedsSuccess,
                            })
                        }}
                    >
                        Withdraw
                    </button>
                </div>
            ) : (
                <div className="text-[#9ca3af] fundsContainer">
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
                                onError: (error) =>
                                    console.log("Balances.js -- Withdraw Royalties:", error),
                                onSuccess: handleWithdrawRoyaltiesSuccess,
                            })
                        }}
                    >
                        Withdraw
                    </button>
                </div>
            ) : (
                <div className="text-[#9ca3af] fundsContainer">
                    <div className="ml-4 leading-5 flex">
                        <h4 className="mr-2">Royalties:</h4>
                        <h5 className="text-[15px]">{royaltyBalance}</h5>
                    </div>
                    <div className="grayedOutWithdraw">Withdraw</div>
                </div>
            )}

            <h4 className="text-[#9ca3af] flex justify-center items-center pb-1">{chainName}</h4>
        </div>
    )
}
