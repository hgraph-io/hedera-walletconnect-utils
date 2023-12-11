/**
 * This file defines error handling related to Hedera operations.
 * @see {@link https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/utils/src/errors.ts | WalletConnect Errors}
 */

/**
 * Represents keys of Hedera error types.
 */
export type HederaErrorKey = keyof typeof HEDERA_ERRORS

/**
 * Represents a JSON-RPC error for Hedera operations.
 * @param T - Generic type for additional data in the error response.
 */
export interface HederaErrorResponse<T = any> {
  code: number
  message: string
  data?: T
}

/**
 * WalletConnect has certain
 * {@link https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/utils/src/errors.ts | error code ranges reserved}
 * for WalletConnect use.
 * The following schema uses negative codes to avoid conflicts.
 *
 * @see {@link https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/utils/src/errors.ts | WalletConnect Errors}
 */

/**
 * Object containing specific Hedera errors with their respective codes and messages.
 */
export const HEDERA_ERRORS: { [key: string]: Pick<HederaErrorResponse, 'code' | 'message'> } = {
  INVALID_PARAMS: {
    code: -1,
    message: 'INVALID_PARAMS',
  },
}

/**
 * Represents a JSON-RPC error for Hedera operations.
 * @param T - Generic type for additional data in the error response.
 */
export interface HederaJsonRpcError<T = any> {
  id: number
  jsonrpc: '2.0'
  error: HederaErrorResponse<T>
}

/**
 * Generates a Hedera error response based on the provided key, context, and additional data.
 * @param key - Key representing the specific error type.
 * @param context - Contextual information for the error (optional).
 * @param data - Additional data to include in the error response (optional).
 * @returns A HederaErrorResponse object with the specified code, message, and additional data.
 */
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
