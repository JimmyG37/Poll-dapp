import Post from "./Post"
import GET_POSTS from "../constants/queryPosts"
import CreatePost from "./CreatePost"
import { useQuery } from "@apollo/client"
import { SparklesIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import PostChain from "../artifacts/contracts/PostChain.sol/PostChain.json"

export default function Feed() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainAddress = networkMapping[chainString].PostChain[0]
    const { loading, error, data: createdPosts } = useQuery(GET_POSTS)

    useEffect(() => {}, [isWeb3Enabled, account, createdPosts])

    return (
        <div className="feedContainer">
            <div className="text-black flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 border-gray-200 ">
                <h2 className="text-lg sm:text-xl font-bold sticky">Home</h2>
                <div className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 ml-auto sticky">
                    <SparklesIcon className="h-5 text-black" />
                </div>
            </div>
            {isWeb3Enabled ? (
                loading || !createdPosts ? (
                    <div>Loading...</div>
                ) : (
                    <div>
                        <CreatePost />
                        <div className="pb-72">
                            {createdPosts.posts.map((post) => {
                                return (
                                    <Post
                                        postId={parseInt(post.postId)}
                                        key={`${post.id}${post.postId}`}
                                    />
                                )
                            })}
                        </div>
                    </div>
                )
            ) : (
                <div>Web3 Not Enabled</div>
            )}
        </div>
    )
}
