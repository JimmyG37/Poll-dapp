import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"

function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <Header />
            <Sidebar />
            <Component {...pageProps} />
        </MoralisProvider>
    )
}

export default MyApp
