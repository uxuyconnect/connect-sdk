import { Callback } from '../types';
export enum JSONRPCMethod {
  // synchronous or asynchronous
  eth_accounts = 'eth_accounts',
  // eth_coinbase = 'eth_coinbase',
  net_version = 'net_version',
  eth_chainId = 'eth_chainId',
  eth_uninstallFilter = 'eth_uninstallFilter', // synchronous

  // asynchronous only
  eth_requestAccounts = 'eth_requestAccounts',
  eth_sign = 'eth_sign',
  // eth_ecRecover = 'eth_ecRecover',
  personal_sign = 'personal_sign',
  // personal_ecRecover = 'personal_ecRecover',
  eth_signTransaction = 'eth_signTransaction',
  eth_sendRawTransaction = 'eth_sendRawTransaction',
  eth_sendTransaction = 'eth_sendTransaction',
  eth_signTypedData_v1 = 'eth_signTypedData_v1',
  // eth_signTypedData_v2 = 'eth_signTypedData_v2',
  eth_signTypedData_v3 = 'eth_signTypedData_v3',
  eth_signTypedData_v4 = 'eth_signTypedData_v4',
  eth_signTypedData = 'eth_signTypedData',
  wallet_addEthereumChain = 'wallet_addEthereumChain',
  wallet_switchEthereumChain = 'wallet_switchEthereumChain',
  // wallet_watchAsset = 'wallet_watchAsset',
  // metamask_watchAsset= "metamask_watchAsset",

  // asynchronous pub/sub
  // eth_subscribe = 'eth_subscribe',
  // eth_unsubscribe = 'eth_unsubscribe',

  // asynchronous filter methods
  // eth_newFilter = 'eth_newFilter',
  // eth_newBlockFilter = 'eth_newBlockFilter',
  // eth_newPendingTransactionFilter = 'eth_newPendingTransactionFilter',
  // eth_getFilterChanges = 'eth_getFilterChanges',
  // eth_getFilterLogs = 'eth_getFilterLogs',
}

export interface JsonRpcRequest<T = any> {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: T;
}

export interface JsonRpcResponse<T = any, U = any> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: U;
  } | null;
}

export interface RequestArguments {
  id?:number | string
  /** The RPC method to request. */
  method: string;

  /** The params of the RPC method, . */
  params?: Array<unknown> | object;
}


export interface AddEthereumChainParams {
  chainId: string;
  blockExplorerUrls?: string[];
  chainName?: string;
  iconUrls?: string[];
  rpcUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}


export interface SwitchEthereumChainParams {
  chainId: string;
}

export interface WatchAssetParams {
  type: string;
  options: {
    address: string;
    symbol?: string;
    decimals?: number;
    image?: string;
  };
}


export type SendSyncJsonRpcRequest = {
  method:
  | 'eth_accounts'
  | 'eth_coinbase'
  | 'eth_uninstallFilter'
  | 'net_version';
} & JsonRpcRequest;


export interface Web3Provider {
  // send(request: JsonRpcRequest): JsonRpcResponse;
  // send(request: JsonRpcRequest[]): JsonRpcResponse[];
  // send(request: JsonRpcRequest, callback: Callback<JsonRpcResponse>): void;
  // send(request: JsonRpcRequest[], callback: Callback<JsonRpcResponse[]>): void;
  // send<T = any>(method: string, params?: any[] | any): Promise<T>;

  // sendAsync(request: JsonRpcRequest, callback: Callback<JsonRpcResponse>): void;
  // sendAsync(
  //   request: JsonRpcRequest[],
  //   callback: Callback<JsonRpcResponse[]>
  // ): void;

  request<T>(args: RequestArguments): Promise<T>;

  connected: boolean;
  chainId: string;
  disconnect(): boolean;
}
