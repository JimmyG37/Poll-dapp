import Post from "./Post"
import GET_POSTS from "../constants/queryPosts"
import CreatePost from "./CreatePost"
import { useQuery } from "@apollo/client"
import { SparklesIcon } from "@heroicons/react/24/outline"
import { useEffect, useState, useContext } from "react"
import { PostContext } from "../hooks/PostContext"
import { useMoralis, useWeb3Contract } from "react-moralis"
import CommentSection from "./CommentSection"

export default function Feed({ tipAmount }) {
    const { isWeb3Enabled } = useMoralis()
    const { loading, error, data: createdPosts } = useQuery(GET_POSTS)
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

    useEffect(() => {}, [isWeb3Enabled, createdPosts, isOpen, coords, height, post])

    return (
        <div className="feedContainer relative" onClick={(e) => handleMouseClick(e)}>
            <div className="locationBar">
                <h2 className="location">Home</h2>
                <div className="sparkle">
                    <SparklesIcon className="h-5 text-black" />
                </div>
            </div>
            {isWeb3Enabled ? (
                !createdPosts ? (
                    <div>Loading...</div>
                ) : (
                    <div>
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
                            className={` w-full max-w-2xl text-white rounded-t-[12px] z-50 commentsContainer drop-shadow-2xl ${
                                isOpen
                                    ? ` flex flex-col-reverse fixed bottom-0 top-[${coords.y}] overflow-hidden pt-5`
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
                                coords={coords}
                            />
                        </div>
                    </div>
                )
            ) : (
                <div>Web3 Not Enabled</div>
            )}
        </div>
    )
}
