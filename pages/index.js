import Feed from "../components/Feed"
import Balances from "../components/Balances"
import Widgets from "../components/Widgets"
import Sidebar from "../components/Sidebar"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState, useMemo } from "react"
import { PostContext } from "../hooks/PostContext"
import CommentSection from "../components/CommentSection"
import { useTipAmount } from "../hooks/useTipAmount"

export default function Home() {
    const [post, setPost] = useState(null)
    const value = useMemo(() => ({ post, setPost }), [post, setPost])
    const tipAmount = useTipAmount()

    useEffect(() => {}, [])

    return (
        <>
            <PostContext.Provider value={value}>
                <div className="screen">
                    <Sidebar />
                    <Feed tipAmount={tipAmount} />
                    <Widgets />
                </div>
            </PostContext.Provider>
        </>
    )
}
