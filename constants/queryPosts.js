import { gql } from "@apollo/client"

const GET_POSTS = gql`
    {
        posts(orderDirection: desc) {
            id
            creator
            postId
            deadline
        }
    }
`

const GET_LIKES = gql`
    {
        likes(first: 5) {
            user
            postId
            commentId
        }
    }
`
export default GET_POSTS
