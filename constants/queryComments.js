import { gql } from "@apollo/client"

const GET_COMMENTS = gql`
    {
        comments(orderBy: commentId, orderDirection: desc) {
            id
            commenter
            postId
            commentId
        }
    }
`
export default GET_COMMENTS
