// @ts-nocheck


import AbstractProvider from '../AbstractProvider.js'
import ProxiedProvider from './utils/HttpProvider.js';
import TronWebNode from "tronweb"
import SunWebNode from "sunweb"
// import TronWebNode from "./utils/tronweb"

export type { TronWeb as TronWebInterface } from '../../types/TronLinkProvider/types';
import { type Account, type RequestArguments, type JsonRpcResponse, PROVIDER_ALLIANCE, SwitchEthereumChainParams, initOptions, Web3Provider } from "../../types"






const CONTRACT_ADDRESS = {
    USDT: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    MAIN: "TWaPZru6PR5VjgT4sJrrZ481Zgp3iJ8Rfo",
    SIDE: "TGKotco6YoULzbYisTBuP6DWXDjEgJSpYz",
    //MAIN:"TFLtPoEtVJBMcj6kZPrQrwEdM3W3shxsBU", //testnet mainchain
    //SIDE:"TRDepx5KoQ8oNbFVZ5sogwUxtdYmATDRgX", //testnet sidechain
};
const SIDE_CHAIN_ID = '41E209E4DE650F0150788E8EC5CAFA240A23EB8EB7';
const NODE = {
    //MAIN: {fullNode:'http://47.252.84.158:8070',solidityNode:'http://47.252.84.158:8071',eventServer:'http://47.252.81.14:8070'},
    //SIDE: {fullNode:'tronlinkhttp://47.252.85.90:8070',solidityNode:'http://47.252.85.90:8071',eventServer:'http://47.252.87.129:8070'},
    MAIN: { fullNode: 'https://api.trongrid.io', solidityNode: 'https://api.trongrid.io', eventServer: 'https://api.trongrid.io' },
    SIDE: { fullNode: 'https://sun.tronex.io', solidityNode: 'https://sun.tronex.io', eventServer: 'https://sun.tronex.io' }
};




class ProxyLocalStorage {
    prefix: string = "tg-uxuy-wallet-"
    constructor() { }
    get(key) {
        try {
            let value = localStorage.getItem(`${this.prefix}${key}`)
            return value ? JSON.parse(value) : null
        } catch (error) {
            console.log(error)
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
    console.log("ProxyResponse", reponsePayload)
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

    return (id, fn, timeout = 1000) => {
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



const isReConnect = (lastTime, timeout = 1000 * 60 * 15) => {
    const now = new Date().getTime()
    return now - lastTime > timeout
}


function postTronMessage(message = {}) {
    window.postMessage({
        isUxuy: true,
        message: message
    }, location.origin)
}


const defaultAccount: Account = {
    address: "",
    chainId: "1000001",
    chainKey: "tron",
    alliance: PROVIDER_ALLIANCE.TRON,
    chainName: "tron",
    chainSymbol: "ETH",
    rpcs: ["https://api.trongrid.io"],

}

const ALLIANCE_KEY = Symbol('alliance')
export class TronLinkProvider extends AbstractProvider {



    [ALLIANCE_KEY] = PROVIDER_ALLIANCE.TRON
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




    public selectedAddress: string

    public isTronLink: boolean = true
    public ready: boolean = false;
    public tronWeb: any
    public sunWeb: any
    public _tronWeb: any
    public _sunWeb: any

    public proxiedMethods: null | {
        setAddress: Function,
        setMainAddress: Function,
        setSideAddress: Function,
        sign(transaction?: string | boolean, privateKey?: string | boolean, useTronHeader?: boolean, callbac?: Function | boolean): void,
        signMessageV2: Function,
        multiSign: Function
    };

    // public sign: Function
    // public signMessageV2: Function
    // public multiSign: Function
    // public setHeader: Function
    // public request: Function

    // public setAddress: Function
    constructor(options?: initOptions) {
        super({ protocol: PROVIDER_ALLIANCE.TRON })

        this.proxiedMethods = null


        this.version = this.getAppInfo().version

        this.connectUrl = options?.connect
        this.bridgeUrl = options?.bridge
        this.connect_direct_link = options?.connect_direct_link


        this.eventTimeout = options?.eventTimeout || 60000 * 10
        this.metaData = options?.metaData

        this.storage = new ProxyLocalStorage()


        this.sign = this.sign.bind(this)
        this.request = this.request.bind(this)
        this.signMessageV2 = this.signMessageV2.bind(this)
        this.setAddress = this.setAddress.bind(this)


        // @ts-ignore
        this.initialize()


    }

    // @ts-ignore
    initialize() {
        // if (window.tronLink) return;


        const tronWeb = new TronWebNode(
            new ProxiedProvider(),
            new ProxiedProvider(),
            new ProxiedProvider()
        );
        const tronWeb1 = new TronWebNode(
            new ProxiedProvider(),
            new ProxiedProvider(),
            new ProxiedProvider()
        );

        const tronWeb2 = new TronWebNode(
            new ProxiedProvider(),
            new ProxiedProvider(),
            new ProxiedProvider()
        );

        const sunWeb = new SunWebNode(
            tronWeb1,
            tronWeb2,
            CONTRACT_ADDRESS.MAIN,
            CONTRACT_ADDRESS.SIDE,
            SIDE_CHAIN_ID
        );

        tronWeb.extension = {
            setVisited(href: string) {

            }

        };

        this.proxiedMethods = {
            setAddress: tronWeb.setAddress.bind(tronWeb),
            setMainAddress: sunWeb.mainchain.setAddress.bind(sunWeb.mainchain),
            setSideAddress: sunWeb.sidechain.setAddress.bind(sunWeb.sidechain),
            sign: tronWeb.trx.sign.bind(tronWeb),
            signMessageV2: tronWeb.trx.signMessageV2.bind(tronWeb),
            multiSign: tronWeb.trx.multiSign.bind(tronWeb)
        };




        tronWeb.trx.sign = (...t: any) => this.sign(...t);
        sunWeb.mainchain.trx.sign = (...t: any) => this.sign(...t);
        sunWeb.sidechain.trx.sign = (...t: any) => this.sign(...t);
        tronWeb.trx.signMessageV2 = (...t: any) => this.signMessageV2(...t);
        sunWeb.mainchain.trx.signMessageV2 = (...t: any) => this.signMessageV2(...t);
        sunWeb.sidechain.trx.signMessageV2 = (...t: any) => this.signMessageV2(...t);
        tronWeb.trx.multiSign = (...t: any) => this.multiSign(...t);
        sunWeb.mainchain.trx.multiSign = (...t: any) => this.multiSign(...t);
        sunWeb.sidechain.trx.multiSign = (...t: any) => this.multiSign(...t);
        tronWeb.setHeader = (...t: any) => this.setHeader(...t);
        tronWeb.request = (t: any) => this.request(t, tronWeb);
        sunWeb.request = (t: any) => this.request(t, sunWeb);




        ['setPrivateKey', 'setAddress', 'setFullNode', 'setSolidityNode', 'setEventServer'].map((method) => {
            tronWeb[method] = () => {
                return new Error('TronLink has disabled this method')
            };
            sunWeb.mainchain[method] = () => new Error('TronLink has disabled this method');
            sunWeb.sidechain[method] = () => new Error('TronLink has disabled this method');
        });
        ["setMainGatewayAddress", "setSideGatewayAddress", "setChainId"].map((t => {
            sunWeb[t] = () => new Error('TronLink has disabled this method');
        }));



        tronWeb.ready = false;
        tronWeb.isTronLink = true;

        // 临时兼容v1 主要是所有规范统一
        // 方案1 hack  app注入比较慢 v1是同步的 
        // 方案2 使用全局对象的方式 注入一次拼接 (function(){window.uxuxyAccount={}})(); + injectDappJS
        this._tronWeb = tronWeb
        this._sunWeb = sunWeb;
        this.ready = false


        this._initialize()



    }
    _initialize(allIdentity: ALLIDENITY | any, error?: any) {

        this._isUnlocked = true
        this._initialized = true
        this.tronWeb = this._tronWeb
        this.sunWeb = this._sunWeb
        this.emit('_initialized')
        setTimeout(() => {
            postTronMessage({ action: "connect", data: {} })
        }, 20);
        console.info("tron__initialized")


    }

    async isConnected() {
        return !!this?._account?.address

    }

    setAddress(address = '', name = 'primaryAccountOnly', type = 1) {

        console.log("setAddress", ...arguments)
        console.info('TronWeb: New address configured');
        let isAccountsChanged = this?._account?.address != address
        // if (!isAccountsChanged) return

        const { _tronWeb, _sunWeb } = this

        if (!_tronWeb.isAddress(address)) {
            _tronWeb.defaultAddress = {
                hex: false,
                base58: false
            };
            _tronWeb.ready = false;
            this.tronWeb = false
            this.sunWeb = false

        } else {

            this?.proxiedMethods?.setAddress(address);
            _tronWeb.defaultAddress.name = name;
            _tronWeb.defaultAddress.type = type;
            _sunWeb.mainchain.defaultAddress.name = name;
            _sunWeb.mainchain.defaultAddress.type = type;
            _sunWeb.sidechain.defaultAddress.name = name;
            _sunWeb.sidechain.defaultAddress.type = type;

            this.tronWeb = _tronWeb
            this.sunWeb = _sunWeb
            _tronWeb.ready = true;
            this.ready = true
        }
        // window.postMessage({
        //     message: {
        //         action: "setAccount",
        //         data:{
        //            address:address
        //         }
        //     } 
        // })
        // this.emit("addressChanged", )
        isAccountsChanged && postTronMessage({ action: "accountsChanged", data: address })

    }
    setNode(node: { fullNode: string, solidityNode: string, eventServer: string }) {
        // window.postMessage({
        //     message: {
        //         action: "tabReply",
        //         data:{
        //             data:{
        //                 node: {chain:"_"}
        //             }
        //         }
        //     } 
        // })  
        console.info('TronWeb: New node configured', node);

        const { _tronWeb, _sunWeb } = this
        _tronWeb.fullNode.configure(node.fullNode);
        _tronWeb.solidityNode.configure(node.solidityNode);
        _tronWeb.eventServer.configure(node.eventServer);

        _sunWeb.mainchain.fullNode.configure(NODE.MAIN.fullNode);
        _sunWeb.mainchain.solidityNode.configure(NODE.MAIN.solidityNode);
        _sunWeb.mainchain.eventServer.configure(NODE.MAIN.eventServer);

        _sunWeb.sidechain.fullNode.configure(NODE.SIDE.fullNode);
        _sunWeb.sidechain.solidityNode.configure(NODE.SIDE.solidityNode);
        _sunWeb.sidechain.eventServer.configure(NODE.SIDE.eventServer);

        this._account.rpcs = [NODE.fullNode]
        // postTronMessage({ action: "setNode" })
    }

    setHeader(t = {}) {
        const { _tronWeb, _sunWeb, tronLink } = this
        _tronWeb.fullNode.configure(_tronWeb.fullNode.host, t)
        _tronWeb.solidityNode.configure(_tronWeb.solidityNode.host, t)
        _tronWeb.eventServer.configure(_tronWeb.eventServer.host, t)
        _sunWeb.mainchain.fullNode.configure(_sunWeb.mainchain.fullNode.host, t)
        _sunWeb.mainchain.solidityNode.configure(_sunWeb.mainchain.solidityNode.host, t)
        _sunWeb.mainchain.eventServer.configure(_sunWeb.mainchain.eventServer.host, t)
        this._tronWeb.fullNode.configure(_tronWeb.fullNode.host, t)
        this._tronWeb.solidityNode.configure(_tronWeb.solidityNode.host, t)
        this._tronWeb.eventServer.configure(_tronWeb.eventServer.host, t)
        this._sunWeb.mainchain.fullNode.configure(_sunWeb.mainchain.fullNode.host, t)
        this._sunWeb.mainchain.solidityNode.configure(_sunWeb.mainchain.solidityNode.host, t)
        this._sunWeb.mainchain.eventServer.configure(_sunWeb.mainchain.eventServer.host, t)
    }

    async signMessageV2(message: string) {
        const isConnected = await this.isConnected()
        if (!isConnected) throw "TronWeb: No address configured"
        if (typeof message != 'string') "TronWeb: params type must be String!!"
        console.log('signMessageV2', message);

        return this.request("wallet_signMessage", {
            method: "trx_signMessage",
            methodData: message,
            version: "v2"
        })
    }

    sign(transaction: string & Object, privateKey: boolean | string = false, useTronHeader = true, callback: boolean | Function = false) {

        if (typeof privateKey == 'function') {
            callback = privateKey;
            privateKey = false;
        }

        if (typeof useTronHeader == 'function') {
            callback = useTronHeader;
            useTronHeader = true;
        }

        if (!callback)
            return this._injectPromise(this.sign.bind(this), transaction, privateKey, useTronHeader);

        if (privateKey)
            return this?.proxiedMethods?.sign(transaction, privateKey, useTronHeader, callback);

        if (!transaction)
            return (callback as Function)('Invalid transaction provided');

        if (!this.tronWeb.ready)
            return (callback as Function)('User has not unlocked wallet');


        if (typeof transaction == 'string') {
            console.log('dappSignMessage', transaction);
            this.postMessage(ChannelRquestMethod.dappSignMessage, {
                method: "trx_signMessage",
                methodData: transaction,
                version: "v1"
            }).then((reply: any) => (callback as Function)(null, reply)).catch(err => callback(new Error(err)))
        } else {
            console.log('dappSign', transaction);
            console.log(JSON.stringify(transaction));
            this.postMessage(ChannelRquestMethod.dappSign, transaction).then((reply: any) => (callback as Function)(null, reply)).catch(err => callback(new Error(err)))

        }

    }
    //TODO:等待验证多重签名流  这个要支持配置app插件调试一下参数格式
    // async multiSign(transaction = false, privateKey, permissionId = false, callback = false) {
    //     throw "Uxuy Wallet no support multiSign!!"

    //     if (isType("Function", permissionId)) {
    //         callback = permissionId;
    //         permissionId = 0;
    //     }

    //     if (isType("Function", privateKey)) {
    //         callback = privateKey;
    //         privateKey = false
    //         permissionId = 0;
    //     }
    //     if (!callback)
    //         return this._injectPromise(this.multiSign.bind(this), transaction, privateKey, permissionId);


    //     if (privateKey)
    //         return this.proxiedMethods.multiSign(transaction, privateKey, permissionId, callback);



    //     if (!isType("Object", transaction) || !transaction.raw_data || !transaction.raw_data.contract)
    //         return callback('Invalid transaction provided');
    //     try {
    //         // If owner permission or permission id exists in transaction, do sign directly
    //         // If no permission id inside transaction or user passes permission id, use old way to reset permission id
    //         if (!transaction.raw_data.contract[0].Permission_id && permissionId > 0) {
    //             // set permission id
    //             transaction.raw_data.contract[0].Permission_id = permissionId;

    //             // check if private key insides permission list
    //             const address = this.tronWeb.address.toHex(this.selectedAddress).toLowerCase();
    //             const signWeight = await this.tronWeb.getSignWeight(transaction, permissionId);

    //             if (signWeight.result.code === 'PERMISSION_ERROR') {
    //                 return callback(signWeight.result.message);
    //             }

    //             let foundKey = false;
    //             signWeight.permission.keys.map(key => {
    //                 if (key.address === address)
    //                     foundKey = true;
    //             });

    //             if (!foundKey)
    //                 return callback(privateKey + ' has no permission to sign');

    //             if (signWeight.approved_list && signWeight.approved_list.indexOf(address) != -1) {
    //                 return callback(privateKey + ' already sign transaction');
    //             }

    //             // reset transaction
    //             if (signWeight.transaction && signWeight.transaction.transaction) {
    //                 transaction = signWeight.transaction.transaction;
    //                 if (permissionId > 0) {
    //                     transaction.raw_data.contract[0].Permission_id = permissionId;
    //                 }
    //             } else {
    //                 return callback('Invalid transaction provided');
    //             }
    //         }

    //         // sign

    //         // if (!txCheck(transaction)) { // TODO: @tronweb3/google-protobuf
    //         //     return callback('Invalid transaction');
    //         // }
    //         __jHost('dappSign', 'trx', JSON.stringify(transaction), function (err, reply) {
    //             if (!err) {
    //                 if (typeof reply == 'string' && reply.startsWith('{')) {
    //                     callback(null, JSON.parse(reply));
    //                 } else {
    //                     callback(null, reply);
    //                 }
    //             } else {
    //                 console.log(err);
    //                 callback(new Error(err));
    //             }
    //         });
    //     } catch (error) {
    //         callback(error)
    //     }

    // }
    async request(payload) {
        return walletPromiseTimeoutClear(requestKey, () => this.__request(payload))
    }
    async __request({ method, params }: { method: string, params: any }) {
        console.log("request", ...arguments)
        switch (method) {
            case "eth_requestAccounts":   // 暂时发现有些网站支持了
            case "tron_requestAccounts":
                if(!this._account.address){
                    await this._request({method, params})
                }
                if (method == 'eth_requestAccounts') return [this._account.address]
                return this.ready ? {
                    code: 200,
                    message: "success"
                } : { code: 40001, message: "user rejected" }
                break;
            case "wallet_watchAsset":
                params.options.chain = 'trx'
                return this._request("wallet_watchAsset", params);
            default:
                return {
                    code: 4001,
                    message: `The current method 【${method}】is not supported`
                }
                break;
        }
    }
    async postMessage(method: string, data: any) {

        return super.postMessage(method, this._account.chainId || "1000001", data)
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
        // const id = `${Math.random().toString(36).substr(2, 9)}`
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
        console.log({
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

            const timer = this.eventTimeout > 0 ? setTimeout(() => {
                reject(rpcErrors.invalidRequest({
                    code: errorCodes?.rpc?.timeoutRequest,
                    message: messages.errors.timeOut(method),
                    data: payload as any,
                }))
                eventSource.close()

            }, this.eventTimeout || 60000) : null


            eventSource.addEventListener("message", (event) => {

                console.log("message.........", event?.data, publish_params)

                try {
                    const data = JSON.parse(event?.data)
                    console.log("message....parse", {
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
                        console.log("not match")
                    }
                } catch (error) {
                    console.log(error)
                }
            })
            const url = `${this.connect_direct_link}?startapp=uxuyconnect_${tgUtils.encodeTelegramUrlParameters(direct_params)}`
            Telegram.WebApp.initData && Telegram?.WebApp?.openTelegramLink?.(url)
            // !Telegram.WebApp.initData && window.open(url,"_blank")

            if (!Telegram.WebApp.initData) {
                const match = this.connect_direct_link.match(/t\.me\/([^\/]+)\/([^\/]+)/);
                if (match[1] && match[2]) {
                    !Telegram.WebApp.initData && tgUtils.opendeepLink(`uxuyconnect_${tgUtils.encodeTelegramUrlParameters(direct_params)}`, {
                        domain: match[1],
                        appname: match[2]
                    })
                } else {
                    !Telegram.WebApp.initData && tgUtils.opendeepLink(`uxuyconnect_${tgUtils.encodeTelegramUrlParameters(direct_params)}`)
                }
            }


        })
    }
    _injectPromise(func: Function, ...args: any) {
        return new Promise((resolve, reject) => {
            func(...args, (err: any, res: any) => {
                if (err)
                    reject(err);
                else resolve(res);
            });
        });
    }
} 