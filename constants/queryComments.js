import { gql } from "@apollo/client"

const GET_COMMENTS = gql`
    {
        comments(first: 5) {
            id
            commenter
            postId
            commentId
        }
    }
`
export default GET_COMMENTS
