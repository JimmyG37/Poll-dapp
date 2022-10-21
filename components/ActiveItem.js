import React, { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ListedNft } from "./ListedNft"
import GET_ACTIVE_ITEMs from "../constants/queryActiveItems"
import { useQuery } from "@apollo/client"

export const ActiveItem = ({ tokenId, imageURI }) => {
    const { isWeb3Enabled, user } = useMoralis()
    const { loading, error, data, startPolling, stopPolling } = useQuery(GET_ACTIVE_ITEMs)

    useEffect(() => {}, [isWeb3Enabled, tokenId, imageURI])

    useEffect(() => {
        startPolling(2000)
        return () => {
            stopPolling()
        }
    }, [startPolling, stopPolling])

    return (
        <>
            {isWeb3Enabled && imageURI ? (
                loading || !data ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        {data.activeItems.map((nft) => {
                            if (tokenId == nft.postId) {
                                return (
                                    <ListedNft
                                        key={`${tokenId}${imageURI}`}
                                        price={nft.price}
                                        postId={nft.postId}
                                        seller={nft.seller}
                                        imageURI={imageURI}
                                    />
                                )
                            }
                        })}
                    </>
                )
            ) : (
                <div>Web3 Not Enabled</div>
            )}
        </>
    )
}
