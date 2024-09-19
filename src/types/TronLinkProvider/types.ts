

export enum NetworkType {
    Mainnet = 'Mainnet',
    Shasta = 'Shasta',
    Nile = 'Nile',
    /**
     * When use custom node
     */
    Unknown = 'Unknown',
}

export enum ChainNetwork {
    Mainnet = 'Mainnet',
    Shasta = 'Shasta',
    Nile = 'Nile',
}

export type Network = {
    networkType: NetworkType;
    chainId: string;
    fullNode: string;
    solidityNode: string;
    eventServer: string;
};
/**
 * @deprecated Use Network instead.
 */
export type NetworkNodeConfig = {
    chainId: string;
    chain: string;
    fullNode: string;
    solidityNode: string;
    eventServer: string;
};
// types should be defined in @tronweb3/web3.js, such as tronweb
// as no ts in tronweb
// just defined here
export type Contract = {
    parameter: {
        type_url: string;
        value: Record<string, unknown>;
    };
    type: string;
};

export type Transaction = {
    visible: boolean;
    txID: string;
    raw_data: {
        contract: Contract[];
        ref_block_bytes: string;
        ref_block_hash: string;
        expiration: number;
        fee_limit: number;
        timestamp: number;
    };
    raw_data_hex: string;
    signature?: string[];
    [key: string]: unknown;
};

export type SignedTransaction = Transaction & { signature: string[] };




export interface TronLinkWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

type Provider = {
    host: string;
};

export interface TronWeb {
    ready: boolean;
    toHex(m: string): string;
    fullNode: Provider;
    solidityNode: Provider;
    eventServer: Provider;
    trx: {
        sign(transaction: Transaction, privateKey?: string): Promise<SignedTransaction>;
        sign(message: string, privateKey?: string): Promise<string>;
        // multiSign(...args: any[]): Promise<any>;
        // signMessageV2(message: string, privateKey?: string): Promise<string>;
        getBlockByNumber(index: number): Promise<{ blockID: string }>;
        // signMessageV2(...args: unknown[]): Promise<string>;
    };
    defaultAddress?: {
        base58: string;
        hex: string;
        name: string;
        type: number;
    };
}

export interface ReqestAccountsResponse {
    code: 200 | 4000 | 4001;
    message: string;
}

export interface TronLinkMessageEvent {
    data: {
        isTronLink: boolean;
        message: {
            action: 'setAccount' | 'accountsChanged' | 'setNode' | 'connect' | 'disconnect';
            data?: AccountsChangedEventData | NetworkChangedEventData;
        };
    };
}
export interface AccountsChangedEventData {
    // tronlink will return false when users lock accounts, treat it as string
    address: string;
}

export interface NetworkChangedEventData {
    node: NetworkNodeConfig;
    connectNode: NetworkNodeConfig;
}

interface TronRequestArguments {
    readonly method: string;
    readonly params?: unknown[] | object;
}
interface ProviderRpcError extends Error {
    code: number;
    message: string;
    data?: unknown;
}
type TronEvent = 'connect' | 'disconnect' | 'chainChanged' | 'accountsChanged';

export type TronConnectCallback = (data: { chainId: string }) => void;
export type TronChainChangedCallback = TronConnectCallback;
export type TronDisconnectCallback = (error: ProviderRpcError) => void;
export type TronAccountsChangedCallback = (data: [string?]) => void;
// export interface Tron {
//     request(args: { method: 'eth_requestAccounts' }): Promise<[string]>;
//     request(args: TronRequestArguments): Promise<unknown>;

//     on(event: 'connect', cb: TronConnectCallback): void;
//     on(event: 'disconnect', cb: TronDisconnectCallback): void;
//     on(event: 'chainChanged', cb: TronChainChangedCallback): void;
//     on(event: 'accountsChanged', cb: TronAccountsChangedCallback): void;

//     removeListener(event: TronEvent, cb: unknown): void;
//     tronWeb: TronWeb | false;
//     isTronLink: boolean;
// }
