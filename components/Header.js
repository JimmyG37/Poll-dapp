import { ConnectButton } from "web3uikit"
import { Navbar } from "flowbite-react"
import Logo from "./Logo"
import Link from "next/link"

export default function Header() {
    return (
        <div className="py-2 border-b-2 border-gray-100">
            <Navbar>
                <Navbar.Brand>
                    <Logo />
                    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white ml-5">
                        PostChain
                    </span>
                </Navbar.Brand>

                <Navbar.Toggle />
                <ConnectButton moralisAuth={false} />
            </Navbar>
        </div>
    )
}
