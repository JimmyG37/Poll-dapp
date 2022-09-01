import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"

const client = new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/jimmyg37/postchainv2",
    cache: new InMemoryCache(),
})

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </div>
    )
}

export default MyApp
