import { ConnectButton } from "web3uikit"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-4 border-b-2 flex flex-row justify-between items-center">
            <h1 className="py-4 pl-12 font-bold text-3xl">PostChain</h1>
            <div className="flex flex-row items-center">
                <Link href="/">
                    <a className="mr-4 p-6">Home</a>
                </Link>
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}