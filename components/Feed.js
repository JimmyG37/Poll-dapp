import { useQuery } from "@apollo/client"
import { useMoralis, useWeb3Contract } from "react-moralis"
import GET_POSTS from "../constants/subgraphQueries"
import Post from "./Post"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"
import networkMapping from "../constants/networkMapping.json"

export default function Feed() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const { loading, error, data: createdPosts } = useQuery(GET_POSTS)

    return (
        <div className="flex-grow border-l border-r border-slate-50 max-w-2xl sm:ml-[73px] xl:ml-[370px]">
            {isWeb3Enabled ? (
                loading || !createdPosts ? (
                    <div>Loading...</div>
                ) : (
                    <div className="pb-72">
                        {createdPosts.posts.map((post) => {
                            return <Post key={post.id} postIdentifier={post.postId} />
                        })}
                    </div>
                )
            ) : (
                <div>Web3 Not Enabled</div>
            )}
        </div>
    )
}
