import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import Feed from "../components/Feed"
import Balances from "../components/Balances"
import Sidebar from "../components/Sidebar"

export default function Home() {
    return (
        <div>
            <div className="min-h-screen flex max-w-[1500px] mx-auto">
                <Sidebar />
                <Feed />
                <Balances />
            </div>
        </div>
    )
}
