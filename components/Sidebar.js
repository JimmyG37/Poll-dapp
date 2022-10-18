import { TabList, Button } from "@web3uikit/web3"
import Link from "next/link"

export default function Sidebar() {
    return (
        <div className="sidebar">
            <div className="space-y-2.5 mt-4 mb-2.5 xl:ml-24">
                <div className={`sidebarPosition`}>
                    <Link href="/">
                        <a>Home</a>
                    </Link>
                </div>
            </div>
        </div>
    )
}
