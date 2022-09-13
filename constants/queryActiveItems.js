import { gql } from "@apollo/client"

const GET_ACTIVE_ITEMs = gql`
    {
        activeItems(first: 5, where: { buyer: "0x0000000000000000000000000000000000000000" }) {
            id
            buyer
            seller
            nftAddress
            postId
            price
        }
    }
`
export default GET_ACTIVE_ITEMs
