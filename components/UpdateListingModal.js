import { Modal, Input, useNotification } from "@web3uikit/core"
import { useState, useEffect } from "react"
import { useWeb3Contract } from "react-moralis"
import PostChainMarket from "../artifacts/contracts/PostChainMarket.sol/PostChainMarket.json"
import { ethers } from "ethers"

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    isVisible,
    marketAddress,
    onClose,
}) {
    const postChainMarketAbi = PostChainMarket.abi

    const dispatch = useNotification()

    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0)

    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "listing updated",
            title: "Listing updated - please refresh (and move blocks)",
            position: "topR",
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0")
    }

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: postChainMarketAbi,
        contractAddress: marketAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            postId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    })

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                updateListing({
                    onError: (error) => console.log(error),
                    onSuccess: handleUpdateListingSuccess,
                })
            }}
            title={<div className="text-2xl font-bold">Price</div>}
        >
            <Input
                label="Update listing price"
                name="New listing price"
                type="number"
                onChange={(event) => {
                    setPriceToUpdateListingWith(event.target.value)
                }}
            />
        </Modal>
    )
}
