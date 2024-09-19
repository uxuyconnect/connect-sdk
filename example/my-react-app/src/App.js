
import './App.css';
import { WalletTgSdk } from '@uxuycom/web3-tg-sdk';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ethers, Transaction } from 'ethers';
import * as ethSigUtil from "eth-sig-util"


let isInjected = localStorage.getItem("__isInjected");
const walletTgSdk = new WalletTgSdk({ injected: !!isInjected });


const ethereum = isInjected ? window.ethereum : walletTgSdk.ethereum



const CHIANS = [
  {
    "chainId": 137, "chainKey": "polygon", "chainName": "Polygon", "chainSymbol": "MATIC", "chainDecimals": 18,
    "chainRPCs": ["https://polygon-mainnet.public.blastapi.io", "https://polygon.blockpi.network/v1/rpc/public"], "explorer": "https://polygonscan.com/"
  },
  {
    "chainId": 204, "chainKey": "opbnb", "chainName": "opBNB", "chainSymbol": "BNB", "chainDecimals": 18,
    "chainRPCs": ["https://opbnb-mainnet-rpc.bnbchain.org"], "explorer": "https://opbnbscan.com/"
  },
  {
    "chainId": 56, "chainKey": "binance", "chainName": "Binance", "chainSymbol": "BNB", "chainDecimals": 18,
    "chainRPCs": ["https://bnb.rpc.subquery.network/public"], "explorer": "https://bscscan.com/"
  },
]


const erc20Abi = [
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

const ContractAbi = [
  { "inputs": [], "name": "checkIn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  {
    "name": "getCheckedTime",
    "type": "function",
    "inputs": [
      {
        "name": "signer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "constant": true,
    "signature": "0xe6b91d57",
    "stateMutability": "view"
  }
];


async function getTokenInfo(contract, rpc) {
  const provider = new ethers.JsonRpcProvider(rpc)
  try {
    const tokenContract = new ethers.Contract(contract, erc20Abi, provider);
    const [name, symbol, totalSupply, decimals, balance] = await Promise.all([
      tokenContract.name?.()?.catch(_ => ""),
      tokenContract.symbol(),
      tokenContract.totalSupply(),
      tokenContract.decimals(),
      ethereum.selectedAddress ? tokenContract.balanceOf(ethereum.selectedAddress) : Promise.resolve(0)

    ])
    provider.destroy()
    return {
      name,
      symbol,
      totalSupply,
      decimals,
      balance: ethers.formatUnits(balance, decimals)
    }
  } catch (error) {
    provider.destroy()
    throw error
  }






}

async function getTokenInfoViews() {
  const rpc = document.querySelector("#transaction_token_rpc").value;
  const contract = document.querySelector("#transaction_token_contract").value
  if (contract.length != 42) return
  document.querySelector("#select_token_info").innerHTML = `loading...`

  try {
    const {
      name,
      symbol,
      totalSupply,
      decimals,
      balance
    } = await getTokenInfo(contract, rpc)
    document.querySelector("#select_token_info").innerHTML = `
            <p>Token Name: ${name}</p>
            <p>Token Symbol: ${symbol}</p>
          <p>Token Total Supply: ${ethers.formatUnits(totalSupply, decimals)}</p>
          <p>Token Decimals: ${decimals}</p>

          <p>Token Balance: ${balance}</p>
      `

  } catch (error) {
    console.log(error)
    document.querySelector("#select_token_info").innerHTML = `
       ${error?.message}
    `
  }

}

function App() {
  const [state, setState] = useState({
    appInfo: null,
    address: null,
    // chainId: 1,
    chainId: 137,
    signature: null,
    message: "test demo",
    transaction: {
      to: "0x0F9171aFF2dbd8c02Dd9cFEaBDB61fDd8D2675c5",
      value: 0
    }
  })

  const chainConfig = CHIANS.find(chain => chain.chainId == state.chainId)
  const RPC_URL = chainConfig?.chainRPCs?.[0]


  async function init() {
    window?.Telegram?.WebApp?.expand?.()

    const chainId = await ethereum.request({
      method: "eth_chainId",
      params: []
    })
    const accounts = await ethereum.request({
      method: "eth_accounts",
      params: []
    })
    setState({ ...state, chainId: chainId, address: accounts[0] })
    handleEvents()
  }

  useEffect(() => {
    init()
  }, [])



  const handleEvents = useCallback((event) => {
    ethereum.on("accountsChanged", (accounts) => {
 
      setState({ ...state, address: accounts[0] });
    })

    ethereum.on("chainChanged", (chainId) => {
      setState({ ...state, chainId: chainId });
    })
    return () => {
      ethereum.removeAllListeners(); // remove all event
    }
  }, [
    state
  ])



  useLayoutEffect(() => {
    getTokenInfoViews()
  }, [RPC_URL])




  return (
    <div className="App">
      <div style={{ "overflow": "auto", width: "100%" }}>
        <pre >
          {
            JSON.stringify(state, null, 2)
          }
        </pre>
      </div>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
        <button onClick={() => {

          localStorage.setItem("__isInjected", isInjected ? "" : "1")
          window.location.reload()

        }}>Changed to {isInjected ? "telegram" : "window.ethereum"} </button>

      </div>





      {/* Get App Info */}
      {
        !isInjected && <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
          <button onClick={() => {
            setState({ ...state, appInfo: ethereum.getAppInfo() });
          }}>Get App Info</button>

          {state.appInfo && (
            <div>
              <h2>App Info</h2>
              <p>Name: {state.appInfo.name}</p>
              <p>Description: {state.appInfo.description}</p>
              <p><img src={state.appInfo.logo} alt={state.appInfo.name} width="100" /></p>
              <p>homePage:  <a href={state.appInfo.homepage}>{state.appInfo.homepage}</a></p>
              <p>direct_link:  <a href={state.appInfo.deepLinks.direct_link}>{state.appInfo.deepLinks.direct_link}</a></p>
            </div>
          )}
        </div>
      }



      {/* Connect Wallet */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>

        <button onClick={() => {
          ethereum.request({
            method: "eth_requestAccounts",
            params: []
          }).then(result => {
            setState({ ...state, address: result[0] });
          }).catch(error => {

            alert(error.message)
          })
        }}>Connect Wallet</button>

        {state.address && (
          <div>
            <h2>Address</h2>
            <p>{state.address}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>

        <button onClick={() => {
          ethereum.request({
            method: "eth_accounts",
            params: []
          }).then(result => {
            setState({ ...state, address: result[0] });
          }).catch(error => {

            alert(error.message)
          })
        }}>get address</button>

        {state.address && (
          <div>
            <h2>Address</h2>
            <p>{state.address}</p>
          </div>
        )}
      </div>

      {/* wallet_switchEthereumChain */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
        <select
          id="chain_select"
          value={Number(state.chainId)}
          onChange={(e) => {
            alert(e.target.value)
            ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x"+Number(e.target.value).toString(16) }]
            }).catch(error => {
              alert(error.message)
            })
          }}>
          {
            CHIANS.map(chain => (
              <option key={chain.chainId} value={chain.chainId}>{chain.chainName}</option>
            ))
          }
          {/* <option value="1">Ethereum</option>
          <option value="137">Polygon</option>
          <option value="56">Bnb Chain</option> */}
        </select>

        <button onClick={() => {
          ethereum.request({
            method: "eth_chainId",
            params: []
          }).then(result => {
            setState({ ...state, chainId: result });
          }).catch(error => {
            alert(error.message)
          })
        }}>Get Chain Id</button>

        {state.chainId && (
          <div>
            <h2>Chain Id</h2>
            <p>{state.chainId}</p>
          </div>
        )}
      </div>


      {/* personal_sign */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
        <textarea id="personal_sign" value={`test demo`} rows="10" cols="30" />
        <button onClick={() => {
          const message = document.getElementById("personal_sign")?.value;
          // const messageBytes = ethers.hexlify(ethers.toUtf8Bytes(message))
          const messageBytes = message || ethers.hexlify(ethers.toUtf8Bytes(message))
          ethereum.request({
            method: "personal_sign",
            // params: [messageBytes, state.address]
            params: [messageBytes, state.address]


          }).then(result => {
            let recoverPersonalSignature = "";
            try {
              recoverPersonalSignature = ethSigUtil.recoverPersonalSignature({
                data: messageBytes,
                sig: result
              })

            } catch (error) {

              console.log(error)
              recoverPersonalSignature = error?.message || JSON.stringify(error)
            }

            setState({
              ...state, ["personal_sign"]: {
                message: message,
                signature: result,
                recoverPersonalSignature: recoverPersonalSignature
              }
            });
          }).catch(error => {
            alert(error.message)
          })

        }}>personal_sign</button>

        {state["personal_sign"]?.signature && (
          <div>
            <p>{state["personal_sign"]?.signature}</p>
            <p> recoverPersonalSignature: {state["personal_sign"]?.recoverPersonalSignature}</p>
          </div>




        )}
      </div>


      {/* eth_signTypedData_v4 */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
        <textarea id="eth_signTypedData_v4" value={`
        
          {"domain":{"chainId":${parseInt(state.chainId)},"name":"Ether Mail","verifyingContract":"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC","version":"1"},"message":{"contents":"Hello, Bob!","from":{"name":"Cow","wallets":["0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826","0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF"]},"to":[{"name":"Bob","wallets":["0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB","0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57","0xB0B0b0b0b0b0B000000000000000000000000000"]}],"attachment":"0x"},"primaryType":"Mail","types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Group":[{"name":"name","type":"string"},{"name":"members","type":"Person[]"}],"Mail":[{"name":"from","type":"Person"},{"name":"to","type":"Person[]"},{"name":"contents","type":"string"},{"name":"attachment","type":"bytes"}],"Person":[{"name":"name","type":"string"},{"name":"wallets","type":"address[]"}]}}
          
       `} rows="10" cols="30" />
        <button onClick={() => {
          const message = document.getElementById("eth_signTypedData_v4")?.value;
          debugger
          let recoverTypedSignature = ""
          ethereum.request({
            method: "eth_signTypedData_v4",
            params: [
              state.address,
              document.getElementById("eth_signTypedData_v4").value
            ]

          }).then(result => {

            try {
              recoverTypedSignature = ethSigUtil.recoverTypedSignature_v4({
                data: JSON.parse(message),
                sig: result
              })
            } catch (error) {
              console.error(error)
              recoverTypedSignature = error?.message || JSON.stringify(error)
            }

            setState({
              ...state, ["eth_signTypedData_v4"]: {
                message: message,
                signature: result,
                recoverTypedSignature: recoverTypedSignature
              }
            });
          }).catch(error => {
            alert(error.message)
          })

        }}>eth_signTypedData_v4</button>

        {state["eth_signTypedData_v4"]?.signature && (
          <div>
            <p>{state["eth_signTypedData_v4"]?.signature}</p>
            <p> recoverTypedSignature: {state["eth_signTypedData_v4"]?.recoverTypedSignature}</p>
          </div>

        )}
      </div>

      {/* Send Transaction */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
        <h2>Send Transaction</h2>

        <p>From: {state.address}</p>
        {/* <input type="text" /> */}

        <p>To:
          <input type="text" defaultValue={"0x0F9171aFF2dbd8c02Dd9cFEaBDB61fDd8D2675c5"} onChange={(e) => {
            setState({
              ...state, transaction: {
                ...state.transaction,
                to: e?.target?.value
              }
            })

          }} />
        </p>
        <p>Value:
          <input type="number" onChange={(e) => {
            setState({
              ...state, transaction: {
                ...state.transaction,
                to: state.transaction.to,
                value: e.target.value
              }
            })
          }} />
        </p>


    


        <button onClick={() => {
        
          const tx =  {
                from: state.address,
                to: state.transaction.to,
                value: "0x"+ ethers.parseEther("0.001").toString("16")
            }
          ethereum.request({
            method: "eth_sendTransaction",
            params: [
              tx
            ]
            
          }).then(result => {
            setState({ ...state, transaction: { ...state.transaction, hash: result } });
          })
          debugger
        }}>Send</button>


        {state.transaction.hash && (
          <div>
            <h2>Transaction Hash</h2>
            <pre>{
              JSON.stringify(state.transaction, null, 2)}
            </pre>
            <button onClick={() => {
              ethereum.request({
                method: "eth_getTransactionReceipt",
                params: [state.transaction.hash]
              }).then(result => {
                setState({ ...state, transaction: { ...state.transaction, receipt: result } });
              })
            }}>Get Transaction Receipt</button>
          </div>
        )}







      </div>


      {/* Send token Transaction */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
        <h2>Send token Transaction</h2>
        <p>From: {state.address}</p>
        {/* <input type="text" /> */}
        <p>RPC:
          <input type="text" id='transaction_token_rpc' value={RPC_URL} />
        </p>
        <p> Token Contract Address
          <input type="text" id='transaction_token_contract' defaultValue={"0xc2132d05d31c914a87c6611c10748aeb04b58e8f"} onChange={async (e) => {
            getTokenInfoViews()
          }} />
        </p>
        <p id="select_token_info"> </p>

        <p>to Address:
          <input type="text" id='transaction_token_address' defaultValue={"0xdd841835e929fe458948ad31ba43b6239c2912a0"} />
        </p>
        <p>amount:
          <input type="number" id='transaction_token_amount' defaultValue={"3"} />
        </p>



        <button onClick={async () => {

          const rpc = document.querySelector("#transaction_token_rpc").value;
          const amount = document.querySelector("#transaction_token_amount").value;
          const to = document.querySelector("#transaction_token_address").value;
          const contract = document.querySelector("#transaction_token_contract").value;


          const provider = new ethers.JsonRpcProvider(rpc);



          const tokenContract = new ethers.Contract(contract, erc20Abi, provider);



          const decimals = await tokenContract.decimals();

          const data = tokenContract.interface.encodeFunctionData('transfer', [to, ethers.parseUnits(String(amount), decimals)]);

          const transaction = {
            from: state.address,
            // to: to,
            to: contract,
            // value: "0x",
            data: data
          }
          ethereum.request({
            method: "eth_sendTransaction",
            params: [
              transaction
            ]
          }).then(result => {
            setState({ ...state, ["transaction_token"]: { ...transaction, hash: result } });
          })
        }}>Send Token Transaction</button>


        {state["transaction_token"]?.hash && (
          <div>
            <h2>Transaction Hash</h2>
            <pre>{
              JSON.stringify(state["transaction_token"], null, 2)}
            </pre>
            <button onClick={() => {
              ethereum.request({
                method: "eth_getTransactionReceipt",
                params: [state["transaction_token"]?.hash]
              }).then(result => {
                const transaction_token = state["transaction_token"]
                setState({ ...state, ["transaction_token"]: { ...transaction_token, receipt: result } });
              })
            }}>Get  transaction token Receipt</button>
          </div>
        )}







      </div>

      {/* Disconnect*/}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
        <h2>Approve Contract</h2>




        <p>From: {state.address}</p>
        <p>RPC:
          <input type="text" id='transaction_token_rpc' value={"https://polygon.blockpi.network/v1/rpc/public"} />
        </p>

        <p>approve Token
          <input type="text" disabled value={"0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"} />
        </p>
        <p>uniswapAddress
          <input type="text" disabled value={"0x000000000022d473030f116ddee9f6b43ac78ba3"} />
        </p>
        <p>
          approve amount select
          <select id="approve_select" onChange={e => {
            const dom = document.querySelector("#approve_input_amount")
            dom.disabled = e.target.value == 1
            dom.value = ""
            console.log(e.target.value)
          }}>

            <option value="1">UnLimit</option>
            <option value="2">Cancel Approve</option>
            <option value="3">input amount</option>
          </select>
        </p>
        <p>input amount:
          <input id="approve_input_amount" disabled></input>
        </p>

        <button onClick={async () => {

          if (ethereum.chainId != 0x89) {
            await ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: 0x89 }]
            })
          }

          const domSelect = document.querySelector("#approve_select")
          const domInput = document.querySelector("#approve_input_amount");

          const approveUnLimit = domSelect.value == 1
          const amount = approveUnLimit
            ? ethers.MaxUint256
            : (domInput.value == 0 || domInput.value == 2)
              ? 0n
              : ethers.parseUnits(domInput.value, 0);

          const tokenABI = [
            {
              "inputs": [
                { "internalType": "address", "name": "spender", "type": "address" },
                { "internalType": "uint256", "name": "amount", "type": "uint256" }
              ],
              "name": "approve",
              "outputs": [
                { "internalType": "bool", "name": "", "type": "bool" }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ];
          // usdc
          const tokenAddress = '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'
          // uniswap
          const uniswapAddress = '0x000000000022d473030f116ddee9f6b43ac78ba3'


          // Create an instance of ethers.Contract
          const abiCoder = new ethers.AbiCoder();
          const iface = new ethers.Interface(tokenABI);
          const data = iface.encodeFunctionData('approve', [uniswapAddress, amount]);

          // const amount = ethers.utils.parseUnits('1', 'ether'); // Adjust amount as needed
          const transaction = {
            from: state.address,
            to: tokenAddress,
            // value: "0x",
            data: data
          }
          ethereum.request({
            method: "eth_sendTransaction",
            params: [
              transaction
            ]
          }).then(result => {
            setState({ ...state, ["transaction_token"]: { ...transaction, hash: result } });
          })
        }}>Approve</button>


        {state["transaction_token"]?.hash && (
          <div>
            <h2>Transaction Hash</h2>
            <pre>{
              JSON.stringify(state["transaction_token"], null, 2)}
            </pre>
            <button onClick={() => {
              ethereum.request({
                method: "eth_getTransactionReceipt",
                params: [state["transaction_token"]?.hash]
              }).then(result => {
                const transaction_token = state["transaction_token"]
                setState({ ...state, [transaction_token]: { ...transaction_token, receipt: result } });
              })
            }}>Get  transaction token Receipt</button>
          </div>
        )}

      </div>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
        <h2>disconnect</h2>




        <button onClick={() => { ethereum.disconnect() }} >disconnect</button>


      </div>




      {/* Contract Address Call */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", textAlign: "left", margin: "20px", border: "1px solid" }}>
        <h2>Contract Address Call</h2>

        <p>From: {state.address}</p>
        <p> contract Address:
          <input type="text" id='transaction_contract' disabled value={"0x020818b41B5D536570E5224626fbf95dA4D0B453"} />
        </p>




        <button onClick={async () => {

          if (parseInt(state.chainId) != 204) {
            const isConfim = window.confirm("Are you sure to switch to opBnb Chain chain?")

            if (isConfim) {
              await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: 204 }]
              })
            } else {
              return
            }

          }


          // const rpc = document.querySelector("#transaction_token_rpc").value;
          // const ABI = document.querySelector("#transaction_contract_abi").value;
          const contract = document.querySelector("#transaction_contract").value;


          // const provider = new ethers.JsonRpcProvider(rpc);

          const Contract = new ethers.Contract(contract, ContractAbi);


          const data = Contract.interface.encodeFunctionData('checkIn', []);

          const transaction = {
            from: state.address,
            to: contract,
            // value: "0x",
            data: data
          }
          ethereum.request({
            method: "eth_sendTransaction",
            params: [
              transaction
            ]
          }).then(result => {
            setState({ ...state, ["transaction_contract"]: { ...transaction, hash: result } });
          })
        }}>get DEMO  Contract  Transaction</button>


        {state["transaction_contract"]?.hash && (
          <div>
            <h2>Transaction Hash</h2>
            <pre>{
              JSON.stringify(state["transaction_contract"], null, 2)}
            </pre>
            <button onClick={() => {
              ethereum.request({
                method: "eth_getTransactionReceipt",
                params: [state["transaction_contract"]?.hash]
              }).then(result => {
                const transaction_contract = state["transaction_contract"]
                setState({ ...state, ["transaction_contract"]: { ...transaction_contract, receipt: result } });
              })
            }}>Get  transaction token Receipt</button>
          </div>
        )}



      </div>






    </div>
  );
}

export default App;
