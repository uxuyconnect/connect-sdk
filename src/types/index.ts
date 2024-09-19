export * from "./account"
export * from "./types"
export type * from "./EthereumProvider/Web3Provider"
import type { EthereumProvider } from '../provider/EthereumProvider/EthereumProvider';
import type { TronLinkProvider } from '../provider/TronLinkProvider/TronLinkProvider';

export interface initOptions {
    debug?: boolean
    bridge?: string
    connect?: string
    connect_direct_link?: string
    injected?: boolean
    request_timeout?: number
    metaData?: {
        hostname: string
        icon?: string
        name?: string
        url?: string // 
        description?: string
        direct_link?: string
    }
}





export {
  EthereumProvider,
//   UnisatProvider,
  TronLinkProvider,
//   TronLink,
//   TronWeb,
};

export enum PROVIDER_ALLIANCE {
  'EVM' = 'eth',
  'TRON' = 'trx',
  "TON" = "ton"
}

export type WaleltProvider<U extends keyof uxuySdkGlobal, T> =
  | uxuySdkGlobal[U]
  | TronLinkProvider
  | T;





export const PROVIDER_INITIALIZED_EVENT_NAME = {
  [PROVIDER_ALLIANCE.EVM]: 'ethereum#initialized',
  [PROVIDER_ALLIANCE.TRON]: 'tronLink#initialized',
//   [PROVIDER_ALLIANCE.UNISAT]: 'unisat#initialized',
};




export interface uxuySdkGlobal {
  // ethereum?: UyuxEthereumProvider;
  ethereum?: EthereumProvider;
  tronLink?: TronLinkProvider;
  tronWeb?: TronLinkProvider["tronWeb"];
  sunWeb?:  TronLinkProvider["sunWeb"];
//   unisat?: UyuxUnisatProvider;
}

