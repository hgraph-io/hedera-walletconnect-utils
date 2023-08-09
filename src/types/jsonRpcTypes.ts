/* SESSION REQUEST PARAMS */
export type HederaSignAndExecuteTransactionParams = {
  transaction: {
    type: string
    bytes: string
  }
}

export type HederaSignAndReturnTransactionParams = HederaSignAndExecuteTransactionParams

export type HederaSignMessageParams = {
  message: string
}
