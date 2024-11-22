# UXUY-Connect
Welcome to the documents for UXUY Connect SDK. The SDK provides the APIs for developers to build applications with UXUY Wallet on Telegram. By using the SDK, developers can create the wallet like Dapp and perform actions to interact with the Wallet.

## How to use UXUY Connect SDK in Your Project
### Install UXUY core SDK

Use `npm`:

```
npm install @uxuycom/web3-tg-sdk
```
[npm package source](https://www.npmjs.com/package/@uxuycom/web3-tg-sdk)


### Usage

```
import { WalletTgSdk } from 'https://cdn.jsdelivr.net/npm/@uxuycom/web3-tg-sdk';

import { WalletTgSdk } from '@uxuycom/web3-tg-sdk'

const { ethereum } = new WalletTgSdk({
    metaData: {
        name: 'your name',
        icon:"https://example.com/icon.png"
       
    }
})
```

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

### Request Api  

The `request` method is used to make RPC requests to the connected wallet. It takes an object with the following properties:

- `id` (optional): A number or string that identifies the request.
- `method`: The RPC method to request.
- `params` (optional): An array or object of parameters for the RPC method.

The method returns a Promise that resolves with the result of the RPC method call.

- [json-rpc-api from metamask](https://docs.metamask.io/wallet/reference/json-rpc-api/)
- [json-rpc-api from ethereum.org ](https://ethereum.org/zh/developers/docs/apis/json-rpc/)


``` ts

interface RequestArguments {
  id?:number | string
  /** The RPC method to request. */
  method: string;

  /** The params of the RPC method, . */
  params?: Array<unknown> | object;
}

ethereum.request = (args: RequestArguments): Promise<any>
``` 



#### eth_requestAccounts

connect to the wallet and return the address of the connected wallet.

- method: eth_requestAccounts
- - returns: Promise<string[address]>
  
``` ts

 ethereum.request({ method: 'eth_requestAccounts' })

```



#### eth_accounts

return the address of the connected wallet.

-  method: eth_accounts
-  params:
-  returns: Promise<string[address]>
-  
``` ts 
 ethereum.request({ method: 'eth_accounts' })

```


#### eth_chainId

return the chainId of the connected wallet.

-  method: eth_chainId
-  params:
-  returns: Promise<number>
-  
``` ts 
 ethereum.request({ method: 'eth_chainId' })

```


#### wallet_switchEthereumChain

switch the connected wallet to the specified chainId.

-  method: wallet_switchEthereumChain
-  params:
   -  chainId: number | string
-  returns: Promise<boolean>
-  
``` ts
try {
  await ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0xf00' }],
  });
} catch (switchError) {
  // This error code indicates that the chain has not been added to Uxuy Wallet.
}
```



#### eth_sendTransaction

send a transaction to the connected wallet.

-  method: eth_sendTransaction
-  params:
   -  transaction: TransactionObject
-  returns: Promise<string>
-  
``` ts

const accounts = await ethereum.request({ method: 'eth_accounts', params: [{}] })  
const fromAddress =  ethereum.selectedAddress
const transactionParameters = {
  nonce: '0x00', // ignored by Uxuy Wallet
  gasPrice: '0x09184e72a000', // customizable by user during Uxuy Wallet confirmation.
  gas: '0x2710', // customizable by user during Uxuy Wallet confirmation.
  to: '0x0000000000000000000000000000000000000000', // Required except during contract publications.
  from:  fromAddress || accounts[0], // must match user's active address.
  value: '0x00', // Only required to send ether to the recipient from the initiating external account.
  data:
    '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
  chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by Uxuy Wallet.
};

 ethereum.request(
    { 
        method: 'eth_sendTransaction', 
        params: [ 
            transactionParameters
        ] 
    }
)
```




### SignData Api

- personal_sign
- eth_signTypedData
- eth_signTypedData_v3
- eth_signTypedData_v4

You can refer to docs
[signing-data-with-metamask](https://docs.metamask.io/wallet/how-to/sign-data/#signing-data-with-metamask)
[eth-sig-util](https://github.com/MetaMask/eth-sig-util)

#### Personal_sign

sign a message with the connected wallet.

-  method: personal_sign
-  params:
   -  message: string
   -  address: string
-  returns: Promise<string>
-  
``` ts
 ethereum.request({ method: 'personal_sign', params: ['hello', '0x1234567890'] })

```


#### eth_signTypedData_v3


-  params:
-  returns: Promise<string>
```
 ethereum.request({ method: 'eth_signTypedData_v3', params: [{}, '0x1234567890'] })
``` 

#### eth_signTypedData_v4

-  params:
-  returns: Promise<string>
```
 ethereum.request({ method: 'eth_signTypedData_v4', params: [{}] })
``` 



### Event Listeners
Notify when address and network change. Uses [eventemitter3](https://www.npmjs.com/package/eventemitter3).


#### accountChanged
-  params:
-  
```ts 
 ethereum.on('accountsChanged', handler: (accounts: Array<string>) => void);

 ethereum.on('accountChanged', (accounts) => {
    console.log(accounts || [])
})
```

#### chainChanged
-  params:
-  
``` ts 

 ethereum.on('chainChanged', (chainId) => {
    console.log(chainId)
})
``` 
 
``` ts 
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








