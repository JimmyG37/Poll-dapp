import Post from "./Post"
import GET_POSTS from "../constants/queryPosts"
import CreatePost from "./CreatePost"
import { useQuery } from "@apollo/client"
import { SparklesIcon } from "@heroicons/react/outline"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

export default function Feed() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const { loading, error, data: createdPosts } = useQuery(GET_POSTS)
    return (
        <div className="flex-grow border-l border-r border-gray-200 max-w-2xl sm:ml-[73px] xl:ml-[370px]">
            <div className="text-black flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 border-gray-200 ">
                <h2 className="text-lg sm:text-xl font-bold ">Home</h2>
                <div className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 ml-auto">
                    <SparklesIcon className="h-5 text-black" />
                </div>
            </div>
            {isWeb3Enabled ? (
                loading || !createdPosts ? (
                    <div>Loading...</div>
                ) : (
                    <div className="pb-72">
                        <CreatePost />
                        {createdPosts.posts.map((post) => {
                            return <Post id={post.postId} key={`${post.id}${post.postId}`} />
                        })}
                    </div>
                )
            ) : (
                <div>Web3 Not Enabled</div>
            )}
        </div>
    )
}
