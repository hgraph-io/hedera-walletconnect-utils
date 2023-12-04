import { JsonRpcResult, JsonRpcResponse, JsonRpcError } from '@walletconnect/jsonrpc-types'
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
 * 2. hedera_sendTransactionOnly
 */
// params
export interface SendTransactionOnlyParams {
  signedTransaction: string
}
// request
export interface SendTransactionOnlyRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.SendTransactionOnly
    params: SendTransactionOnlyParams
  }
}
// result
export interface SendTransactionOnlyResult
  extends JsonRpcResult<TransactionResponseJSON & { precheckCode: number }> {}
// response
export interface SendTransactionOnlyResponse extends EngineTypes.RespondParams {
  response: SendTransactionOnlyResult
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
// request
export interface SignQueryAndSendRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.SignQueryAndSend
    params: {
      signerAccountId: string
      query: string
    }
  }
}
// result
export interface SignQueryAndSendResult extends JsonRpcResult<{ response: string }> {}
// response
export interface SignQueryAndSendResponse extends EngineTypes.RespondParams {
  response: SignQueryAndSendResult
}

/*
 * 5. hedera_signTransactionAndSend
 */
// params
export interface SignTransactionAndSendParams {
  signerAccountId: string
  signedTransaction: string
}
// request
export interface SignTransactionAndSendRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.SignTransactionAndSend
    params: SignTransactionAndSendParams
  }
}

// result
export interface SignTransactionAndSendResult
  extends JsonRpcResult<TransactionResponseJSON & { precheckCode: number }> {}

// response
export interface SignTransactionAndSendResponse extends EngineTypes.RespondParams {
  response: SignTransactionAndSendResult
}
/*
 * 6. hedera_signTransactionBody
 */
// params
export interface SignTransactionBodyParams {
  signerAccountId: string
  transactionBody: string
}

//request
export interface SignTransactionBodyRequest extends EngineTypes.RequestParams {
  request: {
    method: HederaJsonRpcMethod.SignTransactionBody
    params: SignTransactionBodyParams
  }
}

// result
export interface SignTransactionBodyResult extends JsonRpcResult<{ signatureMap: string }> {}

// response
export interface SignTransactionBodyResponse extends EngineTypes.RespondParams {
  response: SignTransactionBodyResult
}
