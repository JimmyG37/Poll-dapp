import { useMoralisQuery, useMoralis } from "react-moralis"
import ListedNfts from "../components/ListedNfts"
import Sidebar from "../components/Sidebar"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMs from "../constants/queryActiveItems"
import { useQuery } from "@apollo/client"

export default function market() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketAddress = networkMapping[chainString].PostChainMarket[0]
    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMs)

    return (
        <div className="min-h-screen flex max-w-[1500px] mx-auto">
            <Sidebar />
            <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    loading || !listedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            console.log("index.js -- nft:", nft)
                            const { price, nftAddress, postId, seller } = nft
                            return (
                                <div>
                                    <ListedNfts
                                        price={price}
                                        nftAddress={nftAddress}
                                        postId={postId}
                                        marketAddress={marketAddress}
                                        seller={seller}
                                        key={`${nftAddress}${postId}`}
                                    />
                                </div>
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
