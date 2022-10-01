import { TabList, Button } from "@web3uikit/web3"
import Link from "next/link"

export default function Sidebar() {
    const menuItems = [
        {
            href: "/",
            title: "Home",
        },
        {
            href: "/profile",
            title: "Profile",
        },
        {
            href: "/market",
            title: "Market",
        },
    ]

    return (
        <div className="sidebar">
            <div className="space-y-2.5 mt-4 mb-2.5 xl:ml-24">
                {menuItems.map(({ href, title }) => (
                    <div
                        className={`text-black flex items-center justify-center xl:justify-start text-xl space-x-3 hoverAnimation`}
                        key={`${href}${title}`}
                    >
                        <Link href={href}>
                            <a>{title}</a>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
