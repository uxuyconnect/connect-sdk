
//@ts-nocheck
import "./utils/telegram-web-app"
import Eventemitter3 from "eventemitter3"
import axios from "axios";

import { tgUtils } from "./utils/utils"


import { type Account, type RequestArguments, type JsonRpcResponse, ALLIANCE, SwitchEthereumChainParams, initOptions, Web3Provider } from "./types"
import { messages, errorCodes, rpcErrors } from "./message";
import { getSiteMetadata, getSyncSiteMetadata } from "./metaData"
import { vaildatorEIP712, resemblesEvmAddress } from "./utils/validator"
import { AppInfo, BASE_URL } from "./constant"


import * as uuid from "uuid";


import { EthereumProvider } from "./provider/index"
// import { EthereumProvider, TronLinkProvider } from "./provider/index"
// import { TonProvider, TonConnect } from './provider';






export class WalletTgSdk extends Eventemitter3 {
    version = AppInfo.version
    ethereum: EthereumProvider
    // tronLink: TronLinkProvider
    getAppInfo = () => {
        return {
            ...AppInfo
        }
    }
    constructor(options?: initOptions) {

        super()


        const metaData = options?.metaData

        this.connectUrl = options?.connect || BASE_URL.connect
        this.bridgeUrl = options?.bridge || BASE_URL.bridge
        this.connect_direct_link = options?.connect_direct_link || BASE_URL.connect_direct_link

        this.debug = options?.debug || false
        this.request_timeout = options?.request_timeout || 60 * 2000

        this.injected = options?.injected || false

        this.metaData = {
            icon: metaData?.icon,

            name: metaData?.name,
            url: metaData?.url,

            direct_link: metaData?.direct_link,

            description: metaData?.description

        }
 



        this._initialize()


    }
    _initialize() {
        //initialize provider
        this.ethereum = new EthereumProvider({
            connect: this.connectUrl,
            bridge: this.bridgeUrl,
            connect_direct_link: this.connect_direct_link,
            metaData: this.metaData,

            debug: this.debug,
            request_timeout: this.request_timeout,
        })
        if(this.debug){
            localStorage?.setItem?.("debug", "uxuy:*")
        }else{
            const debugValue = localStorage?.getItem?.("debug")
            if(debugValue == "uxuy:*"){
                localStorage?.removeItem?.("debug")
            }
        }
        // this.tronLink = new TronLinkProvider({
        //     connect: this.connectUrl,
        //     bridge: this.bridgeUrl,
        //     connect_direct_link: this.connect_direct_link,
        //     metaData: this.metaData
        // })
        if (this.injected) {
            if (!window.ethereum) {
                window.ethereum = this.ethereum
                dispatchEvent(new Event("ethereum#initialized"))
            }
            // if (!window.tronLink) {
            //     window.tronLink = this.tronLink
            //     dispatchEvent(new Event("tronlink#initialized"))
            // }   
            // if(!window.ton){

            // }
            
            // if (!window.tonkeeper) {
            //     const havePrevInstance = !!window.tonkeeper;
                
            //     const provider = new TonProvider(window?.tonkeeper?.provider);
                // const tonconnect = new TonConnect(provider, window?.tonkeeper?.tonconnect);
            //     window.tonkeeper = {
            //         provider,
                    // tonconnect,
            //     };
                

            //     if (!havePrevInstance) {
            //         window.dispatchEvent(new Event('tonready'));
            //       }
            // }else{
            //   
            // }

        }
        this.emit("_initialized")
    }

}





export default {
    WalletTgSdk
}