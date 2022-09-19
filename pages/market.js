import styles from "../styles/Home.module.css"
import MarketFeed from "../components/MarketFeed"
import Balances from "../components/Balances"
import Sidebar from "../components/Sidebar"

export default function Market() {
    return (
        <div>
            <div className="screen">
                <Sidebar />
                <MarketFeed />
                <Balances />
            </div>
        </div>
    )
}
