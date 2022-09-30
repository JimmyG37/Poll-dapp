import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import PostChainMarket from "../artifacts/contracts/PostChainMarket.sol/PostChainMarket.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"
import UpdateListingModal from "./UpdateListingModal"
import Image from "next/image"
import { Card, useNotification } from "@web3uikit/core"
import { ethers } from "ethers"
import { useTruncate } from "../hooks/useTruncate"
import { useTokenURI } from "../hooks/useTokenURI"

export default function ListedNft({ price, nftAddress, postId, marketAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis()
    const postChainMarketAbi = PostChainMarket.abi
    const postChainNftAbi = PostChainNft.abi
    const formattedAddress = useTruncate(seller || "", 15)
    const [imageURI, tokenName, tokenDescription] = useTokenURI(postId)
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)
    const dispatch = useNotification()

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: postChainMarketAbi,
        contractAddress: marketAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: postId,
        },
    })

    useEffect(() => {}, [isWeb3Enabled, imageURI, tokenName, tokenDescription])

    const isOwnedByUser = seller === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser ? "you" : formattedAddress

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: handleBuyItemSuccess,
              })
    }

    const handleBuyItemSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Item bought",
            title: "Item bought",
            position: "topR",
        })
    }

    return (
        <div>
            <div>
                {imageURI ? (
                    <div className="postContainer">
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={postId}
                            marketAddress={marketAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div>
                                <div className="flex flex-col items-center gap-2">
                                    <div>#{postId}</div>
                                    <div className="italic text-sm">
                                        Owned by {formattedSellerAddress}
                                    </div>
                                    <div className="pl-8">
                                        <Image src={imageURI} height="150" width="400" />
                                    </div>
                                    <div className="font-bold">
                                        {ethers.utils.formatUnits(price, "ether")} ETH
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}
