
//@ts-nocheck
import Eventemitter3 from "eventemitter3"
import axios from "axios";

import { EvmErrorCode } from "../../ErrorCode"
import { createAbortController } from "../../utils/create-abort-controller"
import { tgUtils } from "../../utils/utils"

import { type Account, type RequestArguments, type JsonRpcResponse, PROVIDER_ALLIANCE, SwitchEthereumChainParams, initOptions, Web3Provider } from "../../types"
import { messages, errorCodes, rpcErrors } from "../../message";
import { getSiteMetadata, getSyncSiteMetadata } from "../../metaData"
import { vaildatorEIP712, resemblesEvmAddress } from "../../utils/validator"
import { AppInfo, BASE_URL } from "../../constant"
import * as uuid from "uuid";

import AbstractProvider from "../AbstractProvider"

import { debug } from "debug";
import { isAndroidMobile } from "../../utils/tmapi";



const EthereumProviderLogger = debug("uxuy:EthereumProvider")
const EthereumProviderError = debug("uxuy:EthereumProvider:error")


function transfer16(val = 0) {
    val = isNaN(Number(val)) ? 1 : Number(val);
    return '0x' + val.toString(16);
}



const defaultAccount: Account = {
    address: "",
    chainId: "0x1",
    chainKey: "ethereum",
    alliance: PROVIDER_ALLIANCE.EVM,
    chainName: "Ethereum netWork",
    chainSymbol: "ETH"

}


interface HttpProviderOptions {
    chainId: string
    url: string
}

interface RequestOptions {
    account: Account
    metaData: initOptions["metaData"]
    timeStamp: number
}


class HttpProvider {
    options: HttpProviderOptions
    rpcMap: Map<number, string>
    peddingMap: Map<number, any>
    constructor(options?: HttpProviderOptions) {
        this.options = options
        this.rpcMap = new Map()
        this.peddingMap = new Map()
        options?.chainId && this.setUrl(options.url, options.chainId)
    }
    setUrl(url, chainId) {
        this.rpcMap.set(parseInt(chainId), url)
    }
    getUrl(chainId) {
        return this.rpcMap.get(parseInt(chainId))
    }

    async send(payload, options: { chainId: string, chainKey?: string, rpcUrl?: string, account?: Account }) {
        let { method, params, id } = payload
        const rpcUrl = options.rpcUrl || this.getUrl(options.chainId)
        // const { chainId } = options
        // const url = this.rpcMap.get(chainId)
        const requestParams = {
            jsonrpc: "2.0",
            method,
            params,
            id: id || new Date().getTime()
        }

        const response = await axios.post(rpcUrl, requestParams)

        // return response.data
        const { result, error } = response.data
        if (error) {
            throw new Error(error)
        }
        return response.data.result
    }

    async sendBatch(payloads, options = {}) {
        const results = []
        for (const payload of payloads) {
            const result = await this.send(payload, options)
            results.push(result)
        }
        return results
    }
}

class ProxyLocalStorage {
    prefix: string = "tg-uxuy-wallet-"
    constructor() { }
    get(key) {
        try {
            let value = localStorage.getItem(`${this.prefix}${key}`)
            return value ? JSON.parse(value) : null
        } catch (error) {
            console.error(error)
            return null
        }

    }
    set(key, value) {
        try {
            localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value))
            return value
        } catch (error) {
            return null
        }
    }
}

function ProxyResponse(reponsePayload) {
    EthereumProviderLogger("ProxyResponse", reponsePayload)
    const { method, config, params, result } = reponsePayload || {}
    const requestParams = config?.params?.[0] || {}
    if (config) {
        const accounts = config?.accounts
        accounts && (this._accounts = accounts)

        switch (method) {
            case "wallet_switchEthereumChain":
            case "wallet_addEthereumChain":
                const isExist = Object.values(this._accounts || {}).find(account => transfer16(account.chainId) === transfer16(requestParams.chainId))
                if (isExist) {
                    this._account = {
                        ...isExist
                    }
                } else {
                    reponsePayload.error = {
                        code: -32602,
                        message: `uxuy wallet does not support  ${requestParams?.chainId}`

                    }
                }
                break
            case "eth_requestAccounts":
                this._account = this._accounts[this._account?.chainKey] || Object.values(this._accounts)[0]
                break;
            default:
                break;
        }
        return reponsePayload


    }
}



const walletPromiseTimeoutClear = (() => {
    const walletPromiseMap: Map<string, number> = new Map()
    let lastTime = new Date().getTime()

    return async (id, fn, timeout = 1000) => {

        const now = new Date().getTime()
        if (now - lastTime < 500) {
            lastTime = now  
            await new Promise((resolve) => setTimeout(resolve, 500 - (now - lastTime)));
        }
      
          
        
        if (walletPromiseMap.has(id)) return walletPromiseMap.has(id)
        const promise = fn()
        walletPromiseMap.set(id, promise)
        setTimeout(() => {
            walletPromiseMap.delete(id)
        }, timeout);
        return promise.finally(() => {
            walletPromiseMap.delete(id)
        })
    }
})()



const isReConnect = (lastTime, timeout=1000 * 60 * 15) => {
    const now = new Date().getTime()
    return now - lastTime > timeout
}


export class EthereumProvider extends AbstractProvider {
    verison: string
    // state: any
    connectUrl: string
    bridgeUrl: string
    connect_direct_link: string
    httpProvider: HttpProvider
    storage: ProxyLocalStorage

    private _isUnlocked: boolean = true
    private _initialized: boolean = false
    public autoRefreshOnNetworkChange = true
    public _isMetaMask: boolean = true
    public isMetaMask: boolean = true
    public _isConnected: boolean = false
    public isUxuyWallet: boolean = true

    // _accounts: {
    //     [key: string]: Account
    // }
    // _account: Account | null
    get _lastTime() {
        return isNaN(Number(this.storage.get("lastTime") || 0)) ? 0 : Number(this.storage.get("lastTime") || 0)
    }
    set _lastTime(value) {
        this.storage.set("lastTime", value)
    }
    get _account() {
        return this.storage.get("account") || defaultAccount
    }
    set _account(account: Account | null) {

        const oldAccount = { ...(this._account || defaultAccount) }

        if (!account) {
            account = {
                ...oldAccount,
                address: "",
            }
        }
        this.storage.set("account", account)

        if (transfer16(oldAccount?.chainId) != transfer16(account?.chainId)) {
            this.emit("chainChanged", this?.chainId, account?.alliance, account)
            this.emit("networkChanged", parseInt(this?.chainId), account?.alliance)
        }
        if (oldAccount?.address != account?.address) {
            this.emit("accountsChanged", account?.address ? [account?.address] : [])
        }

    }
    get _accounts() {
        return this.storage.get("accounts") || {
            "ethereum": defaultAccount
        }
    }
    set _accounts(accounts: { [key: string]: Account }) {
        this.storage.set("accounts", accounts)
    }


    get networkVersion() {
        return parseInt(this.chainId)
    }

    get chainId() {
        return this._account?.chainId ? transfer16(this._account?.chainId) : null
    }

    get chainKey() {
        return this._account?.chainKey || defaultAccount?.chainKey
    }

    get connected() {
        return this._account?.address ? true : false
    }
    get selectedAddress() {
        return this._account?.address || ""
    }
    


    constructor(options: initOptions) {
        super({
            protocol: PROVIDER_ALLIANCE.EVM
        })

        this.version = this.getAppInfo().version

        this.connectUrl = options.connect
        this.bridgeUrl = options.bridge
        this.connect_direct_link = options.connect_direct_link

        this.request_timeout =  options?.request_timeout || 60000 * 10
        this.metaData = options?.metaData
        this.debug = options?.debug || false

        this.logger = EthereumProviderLogger
        this.error = EthereumProviderError
        

        
        this._metamask = {
            isUnlocked: function () {
                return new Promise((resolve, reject) =>{
                    return resolve(true);
                });
            }
        };

  

        this.storage = new ProxyLocalStorage()
        this.httpProvider = new HttpProvider({
            chainId: "0x1",
            url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",

        })   

        this.request = this.request.bind(this)


        this._initialize()



    }

    _initialize() {
        this._isConnected = true
        this._isUnlocked = true
        this._initialized = true
        this.emit("connect", { chainId: this?.chainId })
        this.emit("_initialized")
        // if (this.connected) {

        // } else {

        // }
    }



    async _walletSwitchChain(payload: { method: string, params: Array<SwitchEthereumChainParams> }) {
        const { method, params } = payload
        const requestParams = params[0];
        let isExist = Object.values(this._accounts || {}).find(account => transfer16(account.chainId) === transfer16(requestParams.chainId))
        if (!isExist) {
            await this.request({
                method: "eth_requestAccounts"
            })
            isExist = Object.values(this._accounts || {}).find(account => transfer16(account.chainId) === transfer16(requestParams.chainId))
            if (!isExist) {
                throw rpcErrors.invalidRequest({
                    code: errorCodes.provider.unsupportedChain,
                    message: messages.errors.invalidChains(requestParams?.chainId),
                    data: params,
                });
                return this._request("wallet_addEthereumChain", params)
            }
        }
        this._account = isExist
        return null

    }

    getAppInfo() {
        return {
            ...AppInfo
        }
    }

    async enable() {
        return this.request({ method: "eth_requestAccounts" })
    }




    isConnected(){
        return this.connected
    }
    async request(payload: RequestArguments): Promise<any> {

        const { method, params = [] } = payload || {}
        this.logger("request", ...arguments)

        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw rpcErrors.invalidRequest({
                message: messages.errors.invalidRequestArgs(),
                data: params,
            });

        }


        if (typeof method !== 'string' || method.length === 0) {
            throw rpcErrors.invalidRequest({
                message: messages.errors.invalidRequestMethod(),
                data: payload as any,
            });

        }

        // if (
        //     params !== undefined &&
        //     !Array.isArray(params) &&
        //     (typeof params !== 'object' || params === null)
        // ) {
        //     throw rpcErrors.invalidRequest({
        //         message: messages.errors.invalidRequestParams(),
        //         data: payload as any
        //     });
        // }

        try {
            const requestKey = `${method}-${JSON.stringify(params || [])}`

            switch (method) {
                case "eth_requestAccounts":

                    const isRreConnected = isReConnect(this._lastTime, this.request_timeout)
                    if (this?._account?.address && !isRreConnected) {
                        return [this._account.address]
                    }
                    return walletPromiseTimeoutClear(requestKey, () => this._request(method, params))
                    break
                case "eth_accounts":
                    return [this._account?.address]
                    break
                case "eth_chainId":
                    return this._account?.chainId ? transfer16(this._account?.chainId) : null
                    break;
                case "wallet_switchEthereumChain":
                case "wallet_addEthereumChain":
                    if (!this.connected) {
                        await this.request({
                            method: "eth_requestAccounts"
                        })
                    }
                    return this._walletSwitchChain({ method, params })
                    break;
                case "wallet_watchAsset":
                case "metamask_watchAsset":
                    return walletPromiseTimeoutClear(requestKey, () => this._request(method, params))
                case "personal_sign":
                case "eth_signTypedData":
                case "eth_sendTransaction":
                case "eth_signTransaction":
                    // case "eth_sign":
                    if (!this.connected) {
                        await this.request({
                            method: "eth_requestAccounts"
                        })
                    }
                    return walletPromiseTimeoutClear(requestKey, () => this._request(method, params))


                    break;
                case "eth_signTypedData_v3":
                case "eth_signTypedData_v4":
                    if (!this.connected) {
                        await this.request({
                            method: "eth_requestAccounts"
                        })
                    }
                    let signPersonalMessageV4 = payload.params[0]
                    if (resemblesEvmAddress(payload.params[0]) && !resemblesEvmAddress(payload.params[1])) {
                        signPersonalMessageV4 = payload.params[1]
                    }
                    params[0] = vaildatorEIP712(signPersonalMessageV4)
                    return walletPromiseTimeoutClear(requestKey, () => this._request(method, params))
                    break

                    break;

                default:
                    return this.httpProvider.send(payload, {
                        chainId: this.chainId,
                        chainKey: this.chainKey,
                        rpcUrl: this._account?.rpcs?.[0] || ""
                    })
                    break;
            }
        } catch (error) {
            this.logger(error)
            return Promise.reject(typeof error == "object" ? error : {
                code: -32603,
                message: error
            })
        }


    }



    async _request(method, params, options?: RequestOptions) {
        const account = this._account
        const now = new Date().getTime()
        this._lastTime = now
        options = {
            account: account,
            metaData: getSyncSiteMetadata(this.metaData),
            ...options,
            timeStamp: now
        }
        const id = new Date().getTime() + Math.floor(Math.random() * 1000).toString()

        const salt = `salt-${Date.now()}-${id}`

        const payload = {
            id,
            method,
            params,
            options
        }


        // push参数
        const publish_params = {
            id: payload.id,
            data: payload,
            version: "1.0",
            salt: salt
        };


        
        const response = await axios.post(
            `${this.connectUrl}/transaction`,
            publish_params,
            {
                headers: {
                    "X-Salt": salt
                }
            }
        );

       

        const { hash, signature } = response.data;
        this.logger({
            hash, signature, salt
        })
        //深度链参数
        const direct_params = {
            method,
            params: [
                salt,
                hash,
                signature
            ]
        }


        const eventSource = new EventSource(`${this.bridgeUrl}/events/${hash}/${signature}/${salt}`)
        
           
               
        // window.eventSource = eventSource
        return new Promise((resolve, reject) => {
            
            const timer = this.request_timeout > 0 ?   setTimeout(() => {
                reject(rpcErrors.invalidRequest({
                    code: errorCodes?.rpc?.timeoutRequest,
                    message: messages.errors.timeOut(method),
                    data: payload as any,
                }))
                eventSource.close()
  
            }, this.request_timeout || 60000) : null

        
            eventSource.addEventListener("message", (event) => {

                this.logger("message.........", event?.data, publish_params)

                try {
                    const data = JSON.parse(event?.data)
                    this.logger("message....parse", {
                        data, publish_params
                    })
                    // TODO: salt || id 
                    if (data?.id == id || salt == data?.salt) {
                        eventSource?.close?.()
                      
                        clearTimeout(timer)
                        if (data.reConnect || !data.error) {
                            ProxyResponse.call(this, data)
                        }
                        data.error ? reject(data.error) : resolve(data.result)
                      
                    } else {
                        this.logger("not match")
                    }
                } catch (error) {
                    this.error(error)
                }
            })
            const url = `${this.connect_direct_link}?startapp=uxuyconnect_${tgUtils.encodeTelegramUrlParameters(direct_params)}`
            // TODO: Android cannot open the connection by default. You need to determine whether it is an Android phone.
            if( Telegram.WebApp.initData ){
                isAndroidMobile() ?  tgUtils.openAndroidLink(url) :  Telegram?.WebApp?.openTelegramLink?.(url)
        
            }else{

               const  match = this.connect_direct_link.match(/t\.me\/([^\/]+)\/([^\/]+)/);
               if(match[1] && match[2]){
                !Telegram.WebApp.initData && tgUtils.opendeepLink(`uxuyconnect_${tgUtils.encodeTelegramUrlParameters(direct_params)}`, {
                    domain: match[1],
                    appname: match[2]
                })
               }else{
                !Telegram.WebApp.initData && tgUtils.opendeepLink(`uxuyconnect_${tgUtils.encodeTelegramUrlParameters(direct_params)}`)
               }
            }
       
        
           
          
       

           
        })
    }



    disconnect() {
        this._account = null

        this.emit('accountsChanged', []);
        this.emit('disconnect', "");
        // this.emit('close', "");
    };
}






