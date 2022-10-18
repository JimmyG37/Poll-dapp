import Balances from "./Balances"
import ListNft from "./ListNft"

export default function Widgets() {
    return (
        <div className="widgetSidebar">
            <Balances />
            <ListNft />
        </div>
    )
}
