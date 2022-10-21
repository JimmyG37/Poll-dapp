import React, { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import PostChainMarket from "../artifacts/contracts/PostChainMarket.sol/PostChainMarket.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"
import UpdateListingModal from "./UpdateListingModal"
import Image from "next/image"
import { Card, useNotification } from "@web3uikit/core"
import { ethers } from "ethers"

export const ListedNft = React.memo(({ price, postId, seller, imageURI }) => {
    const { isWeb3Enabled, account, chainId } = useMoralis()
    const [showModal, setShowModal] = useState(false)

    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketAddress = networkMapping[chainString].PostChainMarket[0]
    const nftAddress = networkMapping[chainString].PostChainNft[0]
    const postChainMarketAbi = PostChainMarket.abi
    const postChainNftAbi = PostChainNft.abi
    const hideModal = () => setShowModal(false)
    const dispatch = useNotification()

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: postChainMarketAbi,
        contractAddress: marketAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            postId: postId,
        },
    })

    const isOwnedByUser = seller === account || seller === undefined

    const buttonStatus = isOwnedByUser ? (
        <button onClick={() => setShowModal(true)} className="marketButton">
            Update Listing
        </button>
    ) : (
        <button
            onClick={() =>
                buyItem({
                    onError: (error) => console.log("ListedNft.js -- error:", error),
                    onSuccess: handleBuyItemSuccess,
                })
            }
            className="marketButton"
        >
            Buy
        </button>
    )

    const handleBuyItemSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Item bought",
            title: "Item bought",
            position: "topR",
        })
    }

    useEffect(() => {}, [isWeb3Enabled, postId, imageURI])

    return (
        <div>
            {imageURI ? (
                <div className="relative">
                    <UpdateListingModal
                        isVisible={showModal}
                        tokenId={postId}
                        marketAddress={marketAddress}
                        nftAddress={nftAddress}
                        onClose={hideModal}
                    />
                    <div className="flex flex-col justify-center items-center gap-2 pl-4 text-white">
                        <div className="font-bold">
                            {ethers.utils.formatUnits(price, "ether")} ETH
                        </div>
                        <div>{buttonStatus}</div>
                    </div>
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
})
