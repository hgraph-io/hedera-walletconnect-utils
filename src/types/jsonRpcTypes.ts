import { TransactionReceipt, TransactionResponse } from '@hashgraph/sdk'

type TransactionParams = {
  transaction: {
    type: string
    bytes: string
  }
}

/** hedera_signAndExecuteTransaction */
export type HederaSignAndExecuteTransactionParams = TransactionParams
export type HederaSignAndExecuteTransactionResponse = {
  response: TransactionResponse
  receipt: TransactionReceipt
}

/** hedera_signAndReturnTransaction */
export type HederaSignAndReturnTransactionParams = TransactionParams
export type HederaSignAndReturnTransactionResponse = TransactionParams

/** hedera_signMessage */
export type HederaSignMessageParams = {
  message: string
}
export type HederaSignMessageResponse = {
  signature: string
}
