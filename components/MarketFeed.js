import { useMoralisQuery, useMoralis } from "react-moralis"
import ListedNft from "./ListedNft"
import SellNft from "./SellNft"
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
            <div className="text-black flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 border-gray-200 ">
                <h2 className="text-lg sm:text-xl font-bold sticky">Market</h2>
                <div className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 ml-auto sticky">
                    <SparklesIcon className="h-5 text-black" />
                </div>
            </div>
            {isWeb3Enabled ? (
                loading || !listedNfts ? (
                    <div>Loading...</div>
                ) : (
                    <div>
                        <SellNft />
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
