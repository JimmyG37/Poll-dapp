import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import Feed from "../components/Feed"

export default function Home() {
    return (
        <div className=" min-h-screen flex max-w-[1500px] mx-auto">
            <Feed />
        </div>
    )
}
