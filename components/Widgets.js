import { useEffect, useState } from "react"
import Balances from "./Balances"
import ListNft from "./ListNft"

export default function Widgets() {
    return (
        <div className="hidden lg:inline ml-[68rem] mt-[3rem] xl:w-[430px] py-1 space-y-5 fixed">
            <Balances />
            <ListNft />
        </div>
    )
}
