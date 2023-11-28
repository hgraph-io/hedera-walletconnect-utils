import { AccountId, SignerSignature, TransactionResponseJSON } from '@hashgraph/sdk'
import { HederaJsonRpcMethod } from './methods'

export type GetNodeAddressesParams = []
export type SendTransactionOnlyParams = [string | string[], string?]
export type SignMessageParams = [string | string[], string?]
export type SignQueryAndSendParams = [string | string[], string?]
export type SignTransactionAndSendParams = [string | string[], string?]
export type SignTransactionBodyParams = [string | string[], string?]

export type RequestsParams = {
  [HederaJsonRpcMethod.GetNodeAddresses]: GetNodeAddressesParams
  [HederaJsonRpcMethod.SendTransactionOnly]: SendTransactionOnlyParams
  [HederaJsonRpcMethod.SignMessage]: SignMessageParams
  [HederaJsonRpcMethod.SignQueryAndSend]: SignQueryAndSendParams
  [HederaJsonRpcMethod.SignTransactionAndSend]: SignTransactionAndSendParams
  [HederaJsonRpcMethod.SignTransactionBody]: SignTransactionBodyParams
}

export type GetNodeAddressesResponse = {
  [key: string]: string | AccountId
}
export type SendTransactionOnlyResponse = TransactionResponseJSON
export type SignMessageResponse = SignerSignature[]
export type SignQueryAndSendResponse = any
export type SignTransactionAndSendResponse = TransactionResponseJSON
export type SignTransactionBodyResponse = string

export type RequestsResponses = {
  [HederaJsonRpcMethod.GetNodeAddresses]: GetNodeAddressesResponse
  [HederaJsonRpcMethod.SendTransactionOnly]: SendTransactionOnlyResponse
  [HederaJsonRpcMethod.SignMessage]: SignMessageResponse
  [HederaJsonRpcMethod.SignQueryAndSend]: SignQueryAndSendResponse
  [HederaJsonRpcMethod.SignTransactionAndSend]: SignTransactionAndSendResponse
  [HederaJsonRpcMethod.SignTransactionBody]: SignTransactionBodyResponse
}
