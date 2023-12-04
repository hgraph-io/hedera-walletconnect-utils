//https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/utils/src/errors.ts
export type HederaErrorKey = keyof typeof HEDERA_ERRORS

// WalletConnect has certain error code ranges reserved for WalletConnect use
// https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/utils/src/errors.ts
// The following schema uses negative codes to avoid conflicts
/*
 * ErrorResponse
 *   - JSON-RPC error can be a primitive or structured value that contains additional information about the error
 *   however, ErrorResponse in WalletConnect is defined as a string, so we allow more robust error handling here
 */
export interface HederaErrorResponse<T = any> {
  code: number
  message: string
  data?: T
}

export const HEDERA_ERRORS: { [key: string]: Pick<HederaErrorResponse, 'code' | 'message'> } = {
  INVALID_PARAMS: {
    code: -1,
    message: 'INVALID_PARAMS',
  },
}

export interface HederaJsonRpcError<T = any> {
  id: number
  jsonrpc: '2.0'
  error: HederaErrorResponse<T>
}

export function getHederaError<T>(
  key: string,
  context?: string | number,
  data?: T,
): HederaErrorResponse<T> {
  const { code, message } = HEDERA_ERRORS[key]
  return {
    code,
    message: context ? `${message} ${context}` : message,
    data,
  }
}
