# **PostChain**

[PostChain](https://postchain-jimmyg37.vercel.app/) is a decentralized application (dApp) built on the Polygon (Matic) Mumbai test network that empowers content creators to take ownership of their creations. With PostChain, users can write a post with a selected deadline and watch as other users engage with their content by commenting.

<img src="https://github.com/JimmyG37/demo-assets/blob/main/createPostv2.gif" width="800" />

Once the deadline has passed, the post creator can mint their post into a unique non-fungible token (NFT) based on the level of engagement. The NFT can then be displayed or listed on the built-in marketplace, where users can earn crypto through tips, NFT proceeds, and royalties. The creator of an NFT will receive a percentage (2.50%) of any re-sale, providing ongoing income for their content.

PostChain offers a user-friendly interface and a seamless experience for transitioning to Web3. Join the growing community of content creators on PostChain and take control of your creations today.

## **Key Features**

- User-friendly platform for creating and sharing content
- Minting of posts into unique NFTs based on engagement, with customizable profile pictures
- Built-in marketplace for displaying and selling NFTs
- Earn crypto through tips, NFT proceeds, and royalties

## **Technologies Used**

- Next.js: frontend framework for building server-rendered React applications
- Tailwind CSS: CSS framework for quickly creating custom designs
- The Graph: a decentralized protocol for indexing and querying data from the Ethereum blockchain
- Hardhat: an environment for testing, compiling, deploying, and debugging dApps based on the Ethereum blockchain
- Solidity: the leading programming language for writing smart contracts on Ethereum
- ERC2981 royalty standard: a smart contract standard for tracking and distributing royalties on Ethereum

## **Getting Started**

To run PostChain, you will need to have the following dependencies installed:

- Git: a version control system for tracking changes in source code
- Node.js: a JavaScript runtime for building server-side applications
- Yarn: a package manager for installing project dependencies

Once these dependencies are installed you can clone the PostChain repository and install the project dependencies using the following commands:

```
git clone https://github.com/JimmyG37/PostChain.git

cd PostChain

yarn install

```

To run the Next.js development server and start using PostChain, run the following command:

```
yarn dev
```
To deploy the smart contracts for PostChain, run the following command:

```
yarn hardhat deploy
```

To run unit tests on the smart contracts, use the following command:

```
yarn hardhat test
```

To generate a coverage report for the smart contracts, use the following command:

```
yarn hardhat coverage
```

For more information on configuring and using PostChain, please see the package.json and hardhat.config.js files in the repository.

## **Contributing**
We welcome contributions to PostChain from the community. To submit a contribution, please fork the repository and create a pull request with your changes. Before submitting your pull request, please make sure to run the unit tests and generate a coverage report to ensure that your changes do not break existing functionality.

## **License**
PostChain is released under the MIT License.



