// @ts-nocheck
// const TronWeb =require( "tronweb");
// import TronWebNode from "./tronweb.js"
import TronWeb  from "tronweb"
import axios from 'axios';

const { HttpProvider } = TronWeb.providers;


class ProxiedProvider extends HttpProvider {
    constructor() {
        super('http://127.0.0.1');

  

        this.ready = false;
        this.queue = [];
    }

    configure(url) {
   

        this.host = url;
        this.instance = axios.create({
            baseURL: url,
            timeout: 30000
        });

        this.ready = true;

        while(this.queue.length) {
            const {
                args,
                resolve,
                reject
            } = this.queue.shift();

            this.request(...args)
                .then(resolve)
                .catch(reject)
                .then(() => (
                    console.info(`Completed the queued request to ${ args[ 0 ] }`)
                ));
        }
    }
    async isConnected(statusPage = this.statusPage) {
        return this.request(statusPage).then(data => {
            return data
        }).catch(() => false);
    }
    request(endpoint, payload = {}, method = 'get') {
        if(!this.ready) {
            console.info(`Request to ${ endpoint } has been queued`);

            return new Promise((resolve, reject) => {
                this.queue.push({
                    args: [ endpoint, payload, method ],
                    resolve,
                    reject
                });
            });
        }

        return super.request(endpoint, payload, method).then(res => {
            const response = res.transaction || res;

            Object.defineProperty(response, '__payload__', {
                writable: false,
                enumerable: false,
                configurable: false,
                value: payload
            });

            return res;
        });
    }
}


export default ProxiedProvider;

// import axios from 'axios';
// import utils from 'utils';

// export default class HttpProvider {
//     constructor(host, timeout = 30000, user = false, password = false, headers = {}, statusPage = '/') {
//         if (!utils.isValidURL(host))
//             throw new Error('Invalid URL provided to HttpProvider');

//         if (isNaN(timeout) || timeout < 0)
//             throw new Error('Invalid timeout duration provided');

//         if (!utils.isObject(headers))
//             throw new Error('Invalid headers object provided');

//         host = host.replace(/\/+$/, '');

//         this.host = host;
//         this.timeout = timeout;
//         this.user = user;
//         this.password = password;
//         this.headers = headers;
//         this.statusPage = statusPage;

//         this.instance = axios.create({
//             baseURL: host,
//             timeout: timeout,
//             headers: headers,
//             auth: user && {
//                 user,
//                 password
//             },
//         });
//     }

//     setStatusPage(statusPage = '/') {
//         this.statusPage = statusPage;
//     }

//     async isConnected(statusPage = this.statusPage) {
//         return this.request(statusPage).then(data => {
//             return utils.hasProperties(data, 'blockID', 'block_header');
//         }).catch(() => false);
//     }

//     request(url, payload = {}, method = 'get') {
//         method = method.toLowerCase();

//         return this.instance.request({
//             data: method == 'post' && Object.keys(payload).length ? payload : null,
//             params: method == 'get' && payload,
//             url,
//             method
//         }).then(({data}) => data);
//     }
// };