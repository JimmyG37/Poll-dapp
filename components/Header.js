import { ConnectButton } from "web3uikit"
import { useMoralis } from "react-moralis"

export default function Header() {
    return (
        <nav className="headerContainer">
            <div className="flex order-first">
                <div className="flex items-center">
                    <span className="headerTitle">PostChain</span>
                </div>
            </div>
            <div className="order-last">
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}
