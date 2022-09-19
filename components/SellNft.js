import { Form, useNotification } from "web3uikit"
import { ethers } from "ethers"
import { Label, TextInput } from "flowbite-react"
import PostChainMarket from "../artifacts/contracts/PostChainMarket.sol/PostChainMarket.json"
import PostChainNft from "../artifacts/contracts/PostChainNft.sol/PostChainNft.json"
import networkMapping from "../constants/networkMapping.json"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"

export default function SellNft() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const postChainMarketAbi = PostChainMarket.abi
    const postChainNftAbi = PostChainNft.abi
    const marketAddress = networkMapping[chainString].PostChainMarket[0]
    const nftAddress = networkMapping[chainString].PostChainNft[0]

    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()

    const approveAndList = async (data) => {
        console.log("Approving...")
        const tokenId = data.data[0].inputResult
        const price = ethers.utils.parseUnits(data.data[1].inputResult, "ether").toString()

        const approveOptions = {
            abi: postChainNftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    const handleApproveSuccess = async (nftAddress, tokenId, price) => {
        console.log("Time to list!")
        const listOptions = {
            abi: postChainMarketAbi,
            contractAddress: marketAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                postId: tokenId,
                price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => {
                console.log(error)
            },
        })
    }

    const handleListSuccess = async () => {
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        })
    }

    useEffect(() => {}, [account, isWeb3Enabled, chainId])

    return (
        <div className="border-b border-gray-200 p-3 flex space-x-3">
            {/* <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "Post ID",
                        type: "number",
                        value: "",
                        key: "postId",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
                title="List your NFT!"
                id="Main Form"
            /> */}
            <form className="flex flex-col gap-4 w-full">
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="postId" value="Your Post ID" />
                    </div>
                    <TextInput id="postId" type="number" placeholder="Post ID" required={true} />
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="price" value="Set Price" />
                    </div>
                    <TextInput
                        id="price"
                        type="number"
                        placeholder="Price (in ETH)"
                        required={true}
                    />
                </div>
                <button
                    className="submitButton"
                    // onClick={(e) => createPost(e)}
                >
                    List
                </button>
            </form>
        </div>
    )
}
