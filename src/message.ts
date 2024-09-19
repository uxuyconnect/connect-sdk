
export const messages = {
  errors: {
    disconnected: () =>
      'UXUYWallet: Disconnected from chain. Attempting to connect.',
    permanentlyDisconnected: () =>
      'UXUYWallet: Disconnected from UXUYWallet background. Page reload required.',
    sendSiteMetadata: () =>
      `UXUYWallet: Failed to send site metadata. This is an internal error, please report this bug.`,
    unsupportedSync: (method: string) =>
      `UXUYWallet: The UXUYWallet Ethereum provider does not support synchronous methods like ${method} without a callback parameter.`,
    invalidDuplexStream: () => 'Must provide a Node.js-style duplex stream.',
    invalidNetworkParams: () =>
      'UXUYWallet: Received invalid network parameters. Please report this bug.',
    invalidRequestArgs: () => `Expected a single, non-array, object argument.`,
    invalidRequestMethod: () => `'args.method' must be a non-empty string.`,
    invalidRequestParams: () =>
      `'args.params' must be an object or array if provided.`,
    invalidLoggerObject: () => `'args.logger' must be an object if provided.`,
    invalidLoggerMethod: (method: string) =>
      `'args.logger' must include required method '${method}'.`,
    invalidChains: (chainId: string) =>
      `'UXUYWallet: not supported chain with ID '${chainId}'. try connect wallet to supported chain.`,
    timeOut: (method: string) =>
      `'UXUYWallet: Timed out while waiting for response from '${method}'.`,

  },
  info: {
    connected: (chainId: string) =>
      `UXUYWallet: Connected to chain with ID "${chainId}".`,
  },
  warnings: {
    // deprecated properties
    chainIdDeprecation: `UXUYWallet: 'ethereum.chainId' is deprecated and may be removed in the future. Please use the 'eth_chainId' RPC method instead.\nFor more information, see: https://github.com/UXUYWallet/UXUYWallet-improvement-proposals/discussions/23`,
    networkVersionDeprecation: `UXUYWallet: 'ethereum.networkVersion' is deprecated and may be removed in the future. Please use the 'net_version' RPC method instead.\nFor more information, see: https://github.com/UXUYWallet/UXUYWallet-improvement-proposals/discussions/23`,
    selectedAddressDeprecation: `UXUYWallet: 'ethereum.selectedAddress' is deprecated and may be removed in the future. Please use the 'eth_accounts' RPC method instead.\nFor more information, see: https://github.com/UXUYWallet/UXUYWallet-improvement-proposals/discussions/23`,
    // deprecated methods
    enableDeprecation: `UXUYWallet: 'ethereum.enable()' is deprecated and may be removed in the future. Please use the 'eth_requestAccounts' RPC method instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1102`,
    sendDeprecation: `UXUYWallet: 'ethereum.send(...)' is deprecated and may be removed in the future. Please use 'ethereum.sendAsync(...)' or 'ethereum.request(...)' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193`,
    // deprecated events
    events: {
      close: `UXUYWallet: The event 'close' is deprecated and may be removed in the future. Please use 'disconnect' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#disconnect`,
      data: `UXUYWallet: The event 'data' is deprecated and will be removed in the future. Use 'message' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#message`,
      networkChanged: `UXUYWallet: The event 'networkChanged' is deprecated and may be removed in the future. Use 'chainChanged' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#chainchanged`,
      notification: `UXUYWallet: The event 'notification' is deprecated and may be removed in the future. Use 'message' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#message`,
    },
    rpc: {
      ethDecryptDeprecation: `UXUYWallet: The RPC method 'eth_decrypt' is deprecated and may be removed in the future.\nFor more information, see: https://medium.com/UXUYWallet/UXUYWallet-api-method-deprecation-2b0564a84686`,
      ethGetEncryptionPublicKeyDeprecation: `UXUYWallet: The RPC method 'eth_getEncryptionPublicKey' is deprecated and may be removed in the future.\nFor more information, see: https://medium.com/UXUYWallet/UXUYWallet-api-method-deprecation-2b0564a84686`,
      walletWatchAssetNFTExperimental: `UXUYWallet: The RPC method 'wallet_watchAsset' is experimental for ERC721/ERC1155 assets and may change in the future.\nFor more information, see: https://github.com/UXUYWallet/UXUYWallet-improvement-proposals/blob/main/MIPs/mip-1.md and https://github.com/UXUYWallet/UXUYWallet-improvement-proposals/blob/main/PROCESS-GUIDE.md#proposal-lifecycle`,
    },
    // misc
    experimentalMethods: `UXUYWallet: 'ethereum._UXUYWallet' exposes non-standard, experimental methods. They may be removed or changed without warning.`,
  },

};
export const errorCodes = {
  rpc: {
    timeoutRequest: -30008, // 超时
    invalidInput: -32000,
    resourceNotFound: -32001,
    resourceUnavailable: -32002,
    transactionRejected: -32003,
    methodNotSupported: -32004,
    limitExceeded: -32005,
    parse: -32700,
    invalidRequest: -32600,
    methodNotFound: -32601,
    invalidParams: -32602,
    internal: -32603,
  },
  provider: {

    unsupportedChain: 4002,
    userRejectedRequest: 4001,
    unauthorized: 4100,
    unsupportedMethod: 4200,
    disconnected: 4900,
    chainDisconnected: 4901,
  },
};

/* eslint-disable @typescript-eslint/naming-convention */
export const errorValues = {
  '-32700': {
    standard: 'JSON RPC 2.0',
    message:
      'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
  },
  '-32600': {
    standard: 'JSON RPC 2.0',
    message: 'The JSON sent is not a valid Request object.',
  },
  '-32601': {
    standard: 'JSON RPC 2.0',
    message: 'The method does not exist / is not available.',
  },
  '-32602': {
    standard: 'JSON RPC 2.0',
    message: 'Invalid method parameter(s).',
  },
  '-32603': {
    standard: 'JSON RPC 2.0',
    message: 'Internal JSON-RPC error.',
  },
  '-32000': {
    standard: 'EIP-1474',
    message: 'Invalid input.',
  },
  '-32001': {
    standard: 'EIP-1474',
    message: 'Resource not found.',
  },
  '-32002': {
    standard: 'EIP-1474',
    message: 'Resource unavailable.',
  },
  '-32003': {
    standard: 'EIP-1474',
    message: 'Transaction rejected.',
  },
  '-32004': {
    standard: 'EIP-1474',
    message: 'Method not supported.',
  },
  '-32005': {
    standard: 'EIP-1474',
    message: 'Request limit exceeded.',
  },
  '4001': {
    standard: 'EIP-1193',
    message: 'User rejected the request.',
  },
  '4100': {
    standard: 'EIP-1193',
    message:
      'The requested account and/or method has not been authorized by the user.',
  },
  '4200': {
    standard: 'EIP-1193',
    message: 'The requested method is not supported by this Ethereum provider.',
  },
  '4900': {
    standard: 'EIP-1193',
    message: 'The provider is disconnected from all chains.',
  },
  '4901': {
    standard: 'EIP-1193',
    message: 'The provider is disconnected from the specified chain.',
  },
};



export const FALLBACK_MESSAGE = 'Unspecified error message. This is a bug, please report it.';
export const rpcErrors = {
  // timeoutRequest: function ({ code, message, data }: { code?: number | string, message?: string, data?: any }) {
  //   code = (code || errorCodes.rpc.invalidRequest).toString()
  //   return {
  //     code: errorCodes.rpc.invalidRequest,
  //     message: message || errorValues[code as ErrorValueKey].message || FALLBACK_MESSAGE,
  //     data
  //   }
  // },
  invalidRequest: function ({ code, message, data }: { code?: number | string, message?: string, data?: any }) {
    code = (code || errorCodes.rpc.invalidRequest).toString()
    return {
      code: code,
      message: message || errorValues[code as ErrorValueKey].message || FALLBACK_MESSAGE,
      data
    }
  },
  methodNotSupported: function ({ code, message, data }: { code?: number, message?: string, data?: any }) {
    return {
      code: errorCodes.rpc.invalidRequest,
      message: FALLBACK_MESSAGE || messages.errors.invalidRequestArgs,
      data
    }
  }

}


export type ErrorValueKey = keyof typeof errorValues

