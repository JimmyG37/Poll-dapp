# PostChain

## About

[PostChain](https://postchain-jimmyg37.vercel.app/) is a decentralized application (dApp), built on Polygon (Matic) Mumbai test network. Need funds?

- https://mumbaifaucet.com/
- https://testmatic.vercel.app/

Users can write a post with a selected date as a deadline

<img src="https://github.com/JimmyG37/demo-assets/blob/main/createPostv2.gif" width="800" />

---

Within the set deadline of a post, other users can comment

<img src="https://github.com/JimmyG37/demo-assets/blob/main/replyToPost.gif" width="800" />


---

  After a post dealine is over, the creator has an option to mint their post


<img src="https://github.com/JimmyG37/demo-assets/blob/main/mintPost.gif" width="800" />


Depending on how many users had commented on the post, will determine what kind of profile picture the nft will get.

---

Once an nft has been created it can then be shown off or listed to sell, all in the same place!

<img src="https://github.com/JimmyG37/demo-assets/blob/main/listPost.gif" width="800" />

---


PostChain offers 3 streams of crypto earnings
* Tips - Posts and Comments can be tipped, even passed the deadline.
* Nft Proceeds - Earnings received when an nft has been sold.
* Royalties - The post creator of the nft will receive a percentage (2.50%) every time the nft gets re-sold

## Motivation

I'm highly inspired to give content creators ownership of what they create! Starting off with what they write. I see this as a perfect opportunity to help bridge the gap to Web3. One of my main objectives was to provide a familiar user interface to support the transition to the new user experience.

## Built with

* NextJS - Frontend framework
* Tailwind CSS - CSS framework
* The Graph - a decentralized protocol used to index and query data from the Ethereum blockchain
* Hardhat - an environment developers use to test, compile, deploy and debug dApps based on the Ethereum blockchain

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an ouput like: `vx.x.x`
- [Yarn](https://yarnpkg.com/getting-started/install) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `x.x.x`
    - You might need to [install it with `npm`](https://classic.yarnpkg.com/lang/en/docs/install/) or `corepack`



## Getting Started

> Install dependencies

```
yarn
```

### Frontend

> run the [Next.js](https://nextjs.org/) development server
```
yarn dev
```

### Smart Contracts

Deploy:

```
yarn hardhat deploy
```

## Testing

```
yarn hardhat test
```

### Test Coverage

```
yarn hardhat coverage
```