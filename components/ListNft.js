import { Form, useNotification } from "@web3uikit/core"
import { ethers } from "ethers"
import PostChainMarket from "../artifacts/contracts/PostChainMarket.sol/PostChainMarket.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"
import networkMapping from "../constants/networkMapping.json"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"

export default function ListNft() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainMarketAbi = PostChainMarket.abi
    const postChainNftAbi = PostChainNft.abi
    const marketAddress = networkMapping[chainString].PostChainMarket[0]
    const nftAddress = networkMapping[chainString].PostChainNft[0]
    const [postId, setPostId] = useState("")
    const [priceInput, setPriceInput] = useState("")

    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()

    const approveAndList = async () => {
        console.log("Approving...")

        const price = ethers.utils.parseUnits(priceInput, "ether").toString()

        const approveOptions = {
            abi: postChainNftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketAddress,
                tokenId: postId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, postId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    const handleApproveSuccess = async (nftAddress, postId, price) => {
        console.log("Time to list!")
        const listOptions = {
            abi: postChainMarketAbi,
            contractAddress: marketAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                postId: postId,
                price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
    }

    const handleListSuccess = async (tx) => {
        await tx.wait(1)
        setPostId("")
        setPriceInput("")
        dispatch({
            type: "success",
            message: "NFT listed!",
            title: "Yay",
            position: "topR",
        })
    }

    useEffect(() => {}, [account, isWeb3Enabled, postId, priceInput])

    return (
        <div className="widgetContainer widget">
            <div className="fundsContainer">
                {isWeb3Enabled ? (
                    <div className="ml-4 w-full">
                        <h4 className="font-bold text-xl pb-4">List Your NFT</h4>
                        <div className="">
                            <label
                                htmlFor="post_id"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                                Post ID
                            </label>
                            <input
                                type="number"
                                id="post_id"
                                value={postId}
                                onChange={(e) => setPostId(e.target.value)}
                                className="widgetInput"
                                placeholder="Post ID"
                                required
                            />
                        </div>
                        <div className="py-4">
                            <label
                                htmlFor="price"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                                Price
                            </label>
                            <input
                                type="number"
                                id="price"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                                className="widgetInput"
                                placeholder="Price (in ETH)"
                                required
                            />
                        </div>
                        <button onClick={approveAndList} className="widgetButton">
                            List
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
