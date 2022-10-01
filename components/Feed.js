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
    const { isWeb3Enabled } = useMoralis()
    const { loading, error, data: createdPosts } = useQuery(GET_POSTS)

    useEffect(() => {}, [isWeb3Enabled, createdPosts])

    return (
        <div className="feedContainer mt-10">
            <div className="locationBar">
                <h2 className="location">Home</h2>
                <div className="sparkle">
                    <SparklesIcon className="h-5 text-black" />
                </div>
            </div>
            {isWeb3Enabled ? (
                loading || !createdPosts ? (
                    <div>Loading...</div>
                ) : (
                    <div className="">
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
