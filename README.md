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