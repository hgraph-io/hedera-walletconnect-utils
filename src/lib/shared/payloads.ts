import type { TransactionResponseJSON } from '@hashgraph/sdk'

/*
 * Request params
 *
 */

export type SignTransactionAndSendParams = {
  signerAccountId: string
  signedTransaction: string
}

export type SendTransactionOnlyParams = {
  signedTransaction: string
}

export type SignTransactionBodyParams = {
  signerAccountId: string
  transactionBody: string
}

export type GetNodeAddressesParams = undefined

export type SignMessageParams = {
  message: string
}

export type QueryParams = {
  query: string
}

/*
 * Responses
 * {
 *  "precheckCode": "<an integer representing the [ResponseCodeEnum] value returned from the Hedera Node, which may indicate success or failure.>",
 *  "transactionId": "<a string encoded transaction identifier of the signed message that was sent to the Hedera node, in <shard>.<realm>.<number>@<seconds>.<nanos> format.>",
 *  "nodeId": "<a string encoded transaction identifier of the Hedera Gossip Node’s Account that the transaction was submitted to, in <shard>.<realm>.<number> format>",
 *  "transactionHash": "<base64 encoding of the SHA384 digest of the signedTransactionBytes of the Transaction message that was submitted to the Hedera Network.>"
 * }
 */

export type SignTransactionAndSendResponse = TransactionResponseJSON & { precheckCode: number }

export type SendTransactionOnlyResponse = TransactionResponseJSON & { precheckCode: number }

export type SignTransactionBodyResponse = {
  signatureMap: string //a base64 encoded string of the protobuf encoded Hedera API TransactionBody message
}

export type GetNodeAddressesResponse = { nodes: string[] }

export type SignMessageResponse = {
  signedMessages: string[]
}
export type QueryResponse = {
  response: string
}
