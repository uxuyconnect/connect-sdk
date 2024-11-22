# UXUY-Connect
Welcome to the documents for UXUY Connect SDK. The SDK provides the APIs for developers to build applications with UXUY Wallet on Telegram. By using the SDK, developers can create the wallet like Dapp and perform actions to interact with the Wallet.

## How to use UXUY Connect SDK in Your Project
### Install UXUY core SDK

Use `npm`:

```javascript index.ts
npm install @uxuycom/web3-tg-sdk
```

[npm package source](https://www.npmjs.com/package/@uxuycom/web3-tg-sdk)

### Import and Initialize the SDK
In your JavaScript file, import and initialize the UXUY-Connect SDK:

 ```javascript index.ts
 import { WalletTgSdk } from `@uxuycom/web3-tg-sdk`;
    
 const { ethereum } = new WalletTgSdk();
 ```

### Connect to Wallet
Implement a function to connect to the UXUY Wallet:

```javascript index.ts
async function connectWallet() {
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected account:', accounts[0]);
        return accounts[0];
    } catch (error) {
        console.error('Failed to connect wallet:', error);
    }
}
```

### Get Chain ID and Get Account
Retrieve the current chain ID:

```javascript index.ts
// Get the current chain ID
async function getChainId() {
    try {
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log('Current chain ID:', chainId);
        return chainId;
    } catch (error) {
        console.error('Failed to get chain ID:', error);
    }
}

// Get the current address
async function getAccounts() {
    try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        console.log('Current address:', accounts[0]);
        return accounts[0];
    } catch (error) {
        console.error('Failed to get address:', error);
    }
}
```

### Send a Transaction
Implement a function to send a transaction:

```javascript index.ts

async function sendTransaction(to, value) {
    try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const transactionParameters = {
            to: to,
            from: accounts[0],
            value: value, // Value in wei
            // gasPrice: '0x09184e72a000', // Customize as needed
            // gas: '0x5208', // 21000 gas limit
        };

        const txHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        console.log('Transaction sent:', txHash);
        return txHash;
    } catch (error) {
        console.error('Failed to send transaction:', error);
    }
}
```

### Listen for Events
Set up event listeners for account and chain changes:

```javascript index.ts
ethereum.on('accountsChanged', (accounts) => {
    console.log('Active account changed:', accounts[0]);
});

ethereum.on('chainChanged', (chainId) => {
    console.log('Network changed to:', chainId);
});
```

## Example usage
Here's a simple example of how to use these functions:

```javascript index.ts

import { WalletTgSdk } from '@uxuycom/web3-tg-sdk';
const { ethereum } = new WalletTgSdk();
let address = null;
let chainId = null;

// Call this function when your DApp initializes
async function initializeWallet() {
    // Check if the wallet is already connected
    let accounts = await ethereum.request({ method: 'eth_accounts' });
    if (!accounts[0]) {
        await ethereum.request({ method: 'eth_requestAccounts' });
    }

    // Get the current account and chain ID
    chainId = await ethereum.request({ method: 'eth_chainId' });
    accounts = await ethereum.request({ method: 'eth_accounts' });
    address = accounts[0];
  

    // Set up event listeners for account and chain changes
    ethereum.removeAllListeners();
    ethereum.on('accountsChanged', (accounts) => {
        address = accounts[0];
        console.log('Active account changed:', accounts[0]);
    });
    ethereum.on('chainChanged', (changedChainId) => {
        chainId = changedChainId
        console.log('Network changed to:', changedChainId);
    });

}


async function sendTransaction(to, value) {

    const transactionParameters = {
        to: to,
        from: address,
        value: value, // Value in wei
        // gasPrice: '0x09184e72a000', // Customize as needed
        // gas: '0x5208', // 21000 gas limit
    };

    const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
    });
    const hash = await sendTransaction(to, value);

    const receipt = await ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
    })

    return receipt;

}

// Call this function to send a transaction 0.001 ether to the address 0x0F9171aFF2dbd8c02Dd9cFEaBDB61fDd8D2675c5

sendTransaction("0x0F9171aFF2dbd8c02Dd9cFEaBDB61fDd8D2675c5", 0.001 * 10 ** 18);
```
          



## How To Build and Test UXUY SDK for local testing
This section provides the instructions on how to build UXUY SDK from source code.


### Prerequisite
Install PNPM: `Execute npm install -g pnpm`   
Install TypeScript: `Run pnpm add typescript -D`
- Install Yalc: Use `npm install -g yalc`

### Steps for Using Yalc for Local Testing of Core-SDK

For manual testing of the core-sdk, set up a separate web project. The guide below uses `yalc` to link the `core-sdk` locally, enabling its installation and import for testing.

Under the `typescript-sdk/packages/web3-tg-sdk` directory:

- Navigate to the `web3-tg-sdk` directory.
- Execute `npm run build` to build your latest code.
- Run `yalc publish`. You should see a message like `@uxuycom/web3-tg-sdk@<version> published in store.` (Note: The version number may vary).

To set up your testing environment (e.g., a new Next.js project), use `yalc add @uxuycom/web3-tg-sdk@<version>` (ensure the version number is updated accordingly).

- Run `pnpm install`. This installs `@uxuycom/web3-tg-sdk@<version>` with your local changes.



### MetaMask Standard Wallet Integration (Beta)

We are pleased to announce the integration of MetaMask's standard wallet. Connection can now be established with a single line of code.

#### Current Status:
- Standard API mode support implemented
- Full MetaMask feature set not yet supported
- Incremental functionality enhancements planned

Code snippet for connection:
```javascript
import { WalletTgSdk } from '@uxuycom/web3-tg-sdk'
const { ethereum } =  new WalletTgSdk({ 
  injected: true  // Whether ethereum is injected into the window; if MetaMask is present, it will not be injected.
})

//Trigger Telegram
ethereum
// use window.ethereum to interact with the wallet
window.ethereum
```

Ethereum Provider API

Supported Networks:
[Additional details would be listed here]

Note: This beta release focuses on core functionality. We appreciate community feedback as we work towards expanding capabilities and refining the integration.

## Ethereum Provider API

#### Supported Chains

The UXUY Wallet Connection is designed to be multi-chain. The following chains are supported:


## Supported Chains

UXUY Wallet supports multiple chains:

| Chain Name   | Chain ID (Decimal) | Chain ID (Hexadecimal) | Chain Specification | DApp Supported |
| ------------ | ------------------ | ---------------------- | ------------------- | -------------- |
| Ethereum     | 1                  | 0x1                    | EVM                 | ✅             |
| BNB Chain    | 56                 | 0x38                   | EVM                 | ✅             |
| Base         | 8453               | 0x2105                 | EVM                 | ✅             |
| Arbitrum     | 42161              | 0xa4b1                 | EVM                 | ✅             |
| Polygon      | 137                | 0x89                   | EVM                 | ✅             |
| Fantom       | 250                | 0xfa                   | EVM                 | ✅             |
| Optimism     | 10                 | 0xa                    | EVM                 | ✅             |
| Avalanche    | 43114              | 0xa86a                 | EVM                 | ✅             |
| zkSync Era   | 324                | 0x144                  | EVM                 | ✅             |
| Linea        | 59144              | 0xe708                 | EVM                 | ❌             |
| Core         | 1116               | 0x45c                  | EVM                 | ✅             |
| zkLink Nova  | 810180             | 0xc5cc4                | EVM                 | ✅             |
| opBNB Chain  | 204                | 0xcc                   | EVM                 | ✅             |
| MAP Protocol | 22776              | 0x58f8                 | EVM                 | ✅             |
| Bitlayer     | 200901             | 0x310c5                | EVM                 | ✅             |
| PlatON       | 210425             | 0x335f9                | EVM                 | ✅             |
| Ton          | -                  | -                      | TON                 | ✅             |
| Tron         | -                  | -                      | TRON                | ✅             |
| Lighting     | -                  | -                      | LIGHTING            | ❌             |
| Flow         | 747                | -                      | EVM                 | ✅             |
| ...          | ...                | ...                    | ...                 | ...            | 

> ⚠️ Warning:EVM chains not supported in the table can be developed using custom chains.

#### chainChanged
-  params:
-  
``` ts 

 ethereum.on('chainChanged', (chainId) => {
    console.log(chainId)
})
``` 
 
``` typescript
// remove all event listeners
ethereum.removeAllListeners();

function handleAccountsChainChanged() {
  ethereum.on('accountsChanged', ([address]) => {
    // Handle the new accounts, or lack thereof.
    // "accounts" will always be an array, but it can be empty.
    alert('address changed');
  });
  ethereum.on('chainChanged', async (chainId) => {
    // Handle the new chain.
    // Correctly handling chain changes can be complicated.
    // We recommend reloading the page unless you have good reason not to.
    alert('chainid changed');
  });
}


// add event listener
function handleAccountsChanged(accounts) {
  // ...
}
//remove
ethereum.removeListener('accountsChanged', handleAccountsChanged); // only remove one 
ethereum.on('accountsChanged', handleAccountsChanged);

```

### More Tutorial
[❓How to add custom chains to the code. #11](https://github.com/orgs/uxuyconnect/discussions/11)

### Resource
 - [tg-dapp-demo](https://github.com/uxuycom/test-tg-dapp)
 - [quickstart](https://docs.uxuy.com/uxuy-connect/quickstart/)
 - [API guide](https://docs.uxuy.com/uxuy-connect/guide/)

## Contributing

We welcome contributions to the UXUY SDK! 

Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the [MIT License](LICENSE.md).









