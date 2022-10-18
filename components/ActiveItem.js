import { useEffect, useState, useContext } from "react"
import { useQuery, useLazyQuery } from "@apollo/client"
import { gql } from "@apollo/client"
import ListedNft from "./ListedNft"

const GET_ACTIVE_ITEMs = gql`
    {
        activeItems(where: { buyer: "0x0000000000000000000000000000000000000000" }) {
            id
            buyer
            seller
            nftAddress
            postId
            price
        }
    }
`

export default function ActiveItem({ tokenId, imageURI }) {
    const { loading, error, data } = useQuery(GET_ACTIVE_ITEMs)

    if (loading) return null
    if (error) return `Error! ${error}`

    return (
        <>
            {data.activeItems.map((nft) => {
                const { price, nftAddress, postId, seller } = nft
                if (tokenId == postId)
                    return (
                        <ListedNft
                            price={price}
                            postId={postId}
                            seller={seller}
                            imageURI={imageURI}
                            key={`${nftAddress}${postId}`}
                        />
                    )
            })}
        </>
    )
}
