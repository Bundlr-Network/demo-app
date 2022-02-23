# Arweave <> Polygon Bridge
> Live Demo:
## Introduction
This app demonstrates usage of the [`bundlr-client`](https://github.com/Bundlr-Network/js-client) to facilitate a bridge for users in Polygon to easily store data into Arweave, packaging them into bundles using a bundler from the [Bundlr Network](https://bundlr.network) app, and dispatching them to the Arweave network.

## Prerequistes
### Arweave
[Arweave](https://www.arweave.org) is a permanent storage network that enables you to store documents and applications forever.

### Polygon
[Polygon](https://polygon.technology) is a decentralised Ethereum scaling platform that enables developers to build scalable user-friendly dApps with low transaction fees without ever sacrificing on security.

### Bundlr

> Bundlr is Bundlr, not Bundler!

[Bundlr](https://bundlr.network) is a multi-chain layer 2 solution for Arweave which enables native support for Arweave storage on different smart contract blockchains using those networks' native tokens for storage payment.

## Architecture

The Demo App is a JS/TS based solution that has the following architecture and workflow.

## Features

- Allow the user to login with their Polygon wallet
- Use bundlr.network to allow users to deploy content with their MATIC tokens
- Show the submitted transactions and their content to the end user

## Implementation Details

### Connect the wallet

This app uses [`web3-react`](https://github.com/NoahZinsmeister/web3-react) to connect with Metamask and WalletConnect. A full explanation of integrating any specific web3 wallet provider can be found there.