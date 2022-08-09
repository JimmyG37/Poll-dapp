import { gql } from "@apollo/client"

const GET_POSTS = gql`
    {
        posts(first: 5) {
            id
            creator
            postId
            likeDeadline
        }
    }
`
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
