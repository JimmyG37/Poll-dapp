import { TabList, Button } from "web3uikit"
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
            href: "/post-chained",
            title: "Post Chained",
        },
    ]

    return (
        <div className="flex-col items-center xl:items-start xl:w-[340px] p-2 fixed h-full">
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
