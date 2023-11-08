import { TransactionReceipt, TransactionResponseJSON } from '@hashgraph/sdk'

type TransactionParams = {
  signerAccountId: string
  transaction: {
    bytes: string // should be a base64 encoded string of a Uint8Array
  }
}

/** hedera_signAndExecuteTransaction */
export type HederaSignAndExecuteTransactionParams = TransactionParams
export type HederaSignAndExecuteTransactionResponse = {
  response: TransactionResponseJSON
  receipt: TransactionReceipt
}

/** hedera_signAndReturnTransaction */
export type HederaSignAndReturnTransactionParams = TransactionParams
export type HederaSignAndReturnTransactionResponse = TransactionParams

/** hedera_signMessage */
export type HederaSignMessageParams = {
  signerAccountId: string
  messages: string[] // should be an array of base64 encoded string of a Uint8Array
}
export type HederaSignMessageResponse = {
  signatures: string[]
}
