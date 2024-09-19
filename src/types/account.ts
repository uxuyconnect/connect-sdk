import { AddressString } from '.';


export enum PROVIDER_ALLIANCE {
    'EVM' = 'eth',
    'TRON' = 'tron',
    "TON" = "ton"
  }

export interface Account {
    alliance: PROVIDER_ALLIANCE,
    chainName: string,
    chainId?: string,
    chainKey: string,
    chainSymbol: string,
    publicKey?: string
    address: AddressString | null | string
    ln_email?: string


}





