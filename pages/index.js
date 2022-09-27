import Feed from "../components/Feed"
import Balances from "../components/Balances"
import Sidebar from "../components/Sidebar"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ConnectButton } from "@web3uikit/web3"

export default function Home() {
    return (
        <div>
            <div className="screen">
                <Sidebar />
                <Feed />
                <Balances />
            </div>
        </div>
    )
}
