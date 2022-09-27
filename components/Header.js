import { ConnectButton } from "web3uikit"
import { useMoralis } from "react-moralis"
import Logo from "./Logo"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-slate-50">
            <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                <div className="flex items-center">
                    <Logo />
                    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-[#1d9bf0] ml-5">
                        PostChain
                    </span>
                </div>
                <div className="flex items-center lg:order-2">
                    <ConnectButton moralisAuth={false} />
                </div>
                <div className="py-2 border-b-2 border-gray-100 flex"></div>
            </div>
        </nav>
    )
}
