import { gql } from "@apollo/client"

const GET_POSTS = gql`
    {
        posts(orderBy: postId, orderDirection: desc) {
            id
            creator
            postId
            deadline
        }
    }
`

const GET_LIKES = gql`
    {
        likes(first: 6) {
            user
            postId
            commentId
        }
    }
`
export default GET_POSTS
