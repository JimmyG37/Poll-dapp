import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import Post from "../components/Post"
import { ArrowLeftIcon } from "@heroicons/react/solid"
import Header from "../components/Header"

export default function PostPage() {
    const router = useRouter()
    const { id } = router.query

    return (
        <div>
            <Header />
            <div className="bg-slate-50 min-h-screen flex max-w-[1500px] mx-auto">
                <Sidebar />
                <div className="flex-grow border-l border-r border-gray-200 max-w-2xl sm:ml-[73px] xl:ml-[370px]">
                    <div className="flex items-center px-1.5 py-2 border-b border-gray-200 text-black font-semibold text-xl gap-x-4 sticky top-0 z-50 bg-slate-50">
                        <div
                            className="hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0"
                            onClick={() => router.push("/")}
                        >
                            <ArrowLeftIcon className="h-5 text-black" />
                        </div>
                        Post
                    </div>

                    <Post id={id} postPage />
                </div>
            </div>
        </div>
    )
}
