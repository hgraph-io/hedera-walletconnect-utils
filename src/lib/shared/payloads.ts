import { JsonRpcResult } from '@walletconnect/jsonrpc-types'
import { EngineTypes } from '@walletconnect/types'
import type { TransactionResponseJSON } from '@hashgraph/sdk'
// import type { PrecheckStatusErrorJSON } from '@hashgraph/sdk/lib/PrecheckStatusError'
import { HederaJsonRpcMethod } from './methods'

/*
 * 1. hedera_getNodeAddresses
 */
// params
export type GetNodeAddressesParams = undefined
// request
export interface GetNodeAddressesRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.GetNodeAddresses
    params: GetNodeAddressesParams
  }
}
// result
export interface GetNodeAddressesResult extends JsonRpcResult<{ nodes: string[] }> {}
// response
export interface GetNodeAddresesResponse extends EngineTypes.RespondParams {
  response: GetNodeAddressesResult
}

/*
 * 2. hedera_executeTransaction
 */
// params
export interface ExecuteTransactionParams {
  signedTransaction: string[]
}
// request
export interface ExecuteTransactionRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.ExecuteTransaction
    params: ExecuteTransactionParams
  }
}
// result
export interface ExecuteTransactionResult
  extends JsonRpcResult<Array<TransactionResponseJSON & { precheckCode: number }>> {}
// response
export interface ExecuteTransactionResponse extends EngineTypes.RespondParams {
  response: ExecuteTransactionResult
}

/*
 * 3. hedera_signMessage
 */
// params
export interface SignMessageParams {
  signerAccountId: string
  message: string
}
// request
export interface SignMessageRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.SignMessage
    params: SignMessageParams
  }
}
// result
export interface SignMessageResult extends JsonRpcResult<{ signatureMap: string }> {}
// response
export interface SignMessageResponse extends EngineTypes.RespondParams {
  response: SignMessageResult
}

/*
 * 4. hedera_signQueryAndSend
 */
// params
export interface SignQueryAndSendParams {
  signerAccountId: string
  query: string
}
// request
export interface SignQueryAndSendRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.SignQueryAndSend
    params: SignQueryAndSendParams
  }
}
// result
export interface SignQueryAndSendResult extends JsonRpcResult<{ response: string }> {}
// response
export interface SignQueryAndSendResponse extends EngineTypes.RespondParams {
  response: SignQueryAndSendResult
}

/*
 * 5. hedera_signAndExecuteTransaction
 */
// params
export interface SignAndExecuteTransactionParams {
  signerAccountId: string
  transaction: string[]
}
// request
export interface SignAndExecuteTransactionRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.SignAndExecuteTransaction
    params: SignAndExecuteTransactionParams
  }
}

// result
export interface SignAndExecuteTransactionResult
  extends JsonRpcResult<Array<TransactionResponseJSON & { precheckCode: number }>> {}

// response
export interface SignAndExecuteTransactionResponse extends EngineTypes.RespondParams {
  response: SignAndExecuteTransactionResult
}
/*
 * 6. hedera_signTransaction
 */

// params
export interface SignTransactionParams {
  signerAccountId: string
  transaction: string[]
}

//request
export interface SignTransactionRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.SignTransaction
    params: SignTransactionParams
  }
}

// result
export interface SignTransactionResult extends JsonRpcResult<string[]> {}

// response
export interface SignTransactionResponse extends EngineTypes.RespondParams {
  response: SignTransactionResult
}
