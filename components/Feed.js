import { Post } from "./Post"
import GET_POSTS from "../constants/queryPosts"
import CreatePost from "./CreatePost"
import { useQuery } from "@apollo/client"
import React, { useEffect, useState, useContext } from "react"
import { PostContext } from "../hooks/PostContext"
import { useMoralis, useWeb3Contract } from "react-moralis"
import CommentSection from "./CommentSection"

export const Feed = React.memo(({ tipAmount }) => {
    const { isWeb3Enabled } = useMoralis()
    const { loading, error, data: createdPosts, startPolling, stopPolling } = useQuery(GET_POSTS)
    const { post } = useContext(PostContext)
    const [coords, setCoords] = useState({ x: 0, y: 0, h: 0 })
    const [isOpen, setIsOpen] = useState(false)

    const height = isOpen ? coords.h : "0px"

    const handleMouseClick = (e) => {
        if (!isOpen) {
            let rect = e.currentTarget.getBoundingClientRect()
            let x = e.clientX - rect.left
            let y = e.clientY - rect.top
            let h = window.innerHeight - e.clientY - 20
            setCoords({
                x: x + "px",
                y: y + "px",
                h: h + "px",
            })
        }
    }

    const showComments = () => {
        setIsOpen(!isOpen)
    }

    useEffect(() => {}, [isWeb3Enabled, isOpen, coords, height])

    useEffect(() => {
        startPolling(5000)
        return () => {
            stopPolling()
        }
    }, [startPolling, stopPolling])

    return (
        <div className="feedContainer relative pt-[3rem]" onClick={(e) => handleMouseClick(e)}>
            {isWeb3Enabled ? (
                loading || !createdPosts ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        <CreatePost />
                        <div className="pb-72 z-[-999] ">
                            {createdPosts.posts.map((post) => {
                                return (
                                    <Post
                                        postId={parseInt(post.postId)}
                                        tipAmount={tipAmount}
                                        showComments={showComments}
                                        key={`${post.id}${post.postId}`}
                                    />
                                )
                            })}
                        </div>
                        <div
                            className={` w-full max-w-2xl text-white rounded-t-[12px] z-50 commentShadow ${
                                isOpen
                                    ? ` flex flex-col-reverse fixed bottom-0 top-[${coords.y}] overflow-hidden pt-5 `
                                    : "absolute"
                            }`}
                            style={{
                                height: `${height}`,
                                transition: "height 500ms ease-in-out",
                            }}
                        >
                            <CommentSection
                                isOpen={isOpen}
                                showComments={showComments}
                                tipAmount={tipAmount}
                            />
                        </div>
                    </>
                )
            ) : (
                <div className="text-white">Web3 Not Enabled</div>
            )}
        </div>
    )
})
