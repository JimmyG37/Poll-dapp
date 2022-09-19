import styles from "../styles/Home.module.css"
import Feed from "../components/Feed"
import Balances from "../components/Balances"
import Sidebar from "../components/Sidebar"

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
