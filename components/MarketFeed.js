import { useMoralisQuery, useMoralis } from "react-moralis"
import ListedNft from "./ListedNft"
import ListNft from "./ListNft"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMs from "../constants/queryActiveItems"
import { SparklesIcon } from "@heroicons/react/24/outline"
import { useQuery } from "@apollo/client"

export default function MarketFeed() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketAddress = networkMapping[chainString].PostChainMarket[0]
    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMs)

    return (
        <div className="feedContainer">
            <div className="locationBar">
                <h2 className="location">Market</h2>
                <div className="sparkle">
                    <SparklesIcon className="h-5 text-black" />
                </div>
            </div>
            {isWeb3Enabled ? (
                loading || !listedNfts ? (
                    <div>Loading...</div>
                ) : (
                    <div>
                        <ListNft />
                        <div className="pb-72">
                            {listedNfts.activeItems.map((nft) => {
                                return (
                                    <ListedNft
                                        price={nft.price}
                                        nftAddress={nft.nftAddress}
                                        postId={nft.postId}
                                        marketAddress={marketAddress}
                                        seller={nft.seller}
                                        key={`${nft.nftAddress}${nft.postId}`}
                                    />
                                )
                            })}
                        </div>
                    </div>
                )
            ) : (
                <div>Web3 Currently Not Enabled</div>
            )}
        </div>
    )
}
