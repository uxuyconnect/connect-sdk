// @ts-nocheck
import EventEmitter from 'eventemitter3';
import { PROVIDER_ALLIANCE } from '../types';

import { tgUtils } from "../utils/utils"
import { AppInfo, BASE_URL } from "../constant"
import { getSiteMetadata, getSyncSiteMetadata } from "../metaData"
import { messages, errorCodes, rpcErrors } from "../message";


export type AbstractAdapterOptions = {
    protocol?: PROVIDER_ALLIANCE
}
export default class AbstractAdapter extends EventEmitter {
  

    constructor({protocol}): AbstractAdapterOptions {
        super();
        this.protocol = protocol 
        this._initializeChannelMessage()

    }

    _initializeChannelMessage(){

    }
    // async _request(method, params, options?: RequestOptions) {

    //     const account = this._account
    //     const now = new Date().getTime()
    //     this._lastTime = now
    //     options = {
    //         account: account,
    //         metaData: getSyncSiteMetadata(this.metaData),
    //         ...options,
    //         timeStamp: now
    //     }
    //     // const id = `${Math.random().toString(36).substr(2, 9)}`
    //     const id = new Date().getTime() + Math.floor(Math.random() * 1000).toString()

    //     const salt = `salt-${Date.now()}-${id}`

    //     const payload = {
    //         id,
    //         method,
    //         params,
    //         options
    //     }


    //     // push参数
    //     const publish_params = {
    //         id: payload.id,
    //         data: payload,
    //         version: "1.0",
    //         salt: salt
    //     };


        
    //     const response = await axios.post(
    //         `${this.connectUrl}/transaction`,
    //         publish_params,
    //         {
    //             headers: {
    //                 "X-Salt": salt
    //             }
    //         }
    //     );

       

    //     const { hash, signature } = response.data;
    //     console.log({
    //         hash, signature, salt
    //     })
    //     //深度链参数
    //     const direct_params = {
    //         method,
    //         params: [
    //             salt,
    //             hash,
    //             signature
    //         ]
    //     }


    //     const eventSource = new EventSource(`${this.bridgeUrl}/events/${hash}/${signature}/${salt}`)
        
           
               
    //     // window.eventSource = eventSource
    //     return new Promise((resolve, reject) => {
            
    //         const timer = this.eventTimeout > 0 ?   setTimeout(() => {
    //             reject(rpcErrors.invalidRequest({
    //                 code: errorCodes?.rpc?.timeoutRequest,
    //                 message: messages.errors.timeOut(method),
    //                 data: payload as any,
    //             }))
    //             eventSource.close()
  
    //         }, this.eventTimeout || 60000) : null

        
    //         eventSource.addEventListener("message", (event) => {

    //             console.log("message.........", event?.data, publish_params)

    //             try {
    //                 const data = JSON.parse(event?.data)
    //                 console.log("message....parse", {
    //                     data, publish_params
    //                 })
    //                 // TODO: salt || id 
    //                 if (data?.id == id || salt == data?.salt) {
    //                     eventSource?.close?.()
                      
    //                     clearTimeout(timer)
    //                     if (data.reConnect || !data.error) {
    //                         ProxyResponse.call(this, data)
    //                     }
    //                     data.error ? reject(data.error) : resolve(data.result)
                      
    //                 } else {
    //                     console.log("not match")
    //                 }
    //             } catch (error) {
    //                 console.log(error)
    //             }
    //         })
    //         const url = `${this.connect_direct_link}?startapp=uxuyconnect_${tgUtils.encodeTelegramUrlParameters(direct_params)}`
    //         Telegram.WebApp.initData && Telegram?.WebApp?.openTelegramLink?.(url)
    //         // !Telegram.WebApp.initData && window.open(url,"_blank")
           
    //        if(!Telegram.WebApp.initData){
    //            const  match = this.connect_direct_link.match(/t\.me\/([^\/]+)\/([^\/]+)/);
    //            if(match[1] && match[2]){
    //             !Telegram.WebApp.initData && tgUtils.opendeepLink(`uxuyconnect_${tgUtils.encodeTelegramUrlParameters(direct_params)}`, {
    //                 domain: match[1],
    //                 appname: match[2]
    //             })
    //            }else{
    //             !Telegram.WebApp.initData && tgUtils.opendeepLink(`uxuyconnect_${tgUtils.encodeTelegramUrlParameters(direct_params)}`)
    //            }
    //        }

           
    //     })
    // }


}


