import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"

const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/31431/postchain/v0.01",
    cache: new InMemoryCache(),
})

function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <ApolloProvider client={client}>
                <Header />
                <Sidebar />
                <Component {...pageProps} />
            </ApolloProvider>
        </MoralisProvider>
    )
}

export default MyApp
