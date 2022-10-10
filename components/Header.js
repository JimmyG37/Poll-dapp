import { ConnectButton } from "web3uikit"
import { useMoralis } from "react-moralis"
import Logo from "./Logo"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="flex h-30 justify-between w-full bg-[#1e1e1e] border-[#373737] px-5 lg:px-6  z-50 fixed mb-5">
            <div className="flex order-first">
                <div className="flex items-center">
                    {/* <Logo /> */}
                    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-[#1d9bf0] ml-5">
                        PostChain
                    </span>
                </div>
                <div className="py-2 border-b-2 border-gray-100 flex"></div>
            </div>
            <div className="order-last">
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}
