export enum HederaJsonRpcMethod {
  prefix_ = 'hedera_',
  SignTransactionBody = 'signTransactionBody',
  SignTransactionAndSend = 'signTransactionAndSend',
  SendTransactionOnly = 'sendTransactionOnly',
  SignQueryAndSend = 'signQueryAndSend',
  SignMessage = 'signMessage',
  GetNodeAddresses = 'getNodeAddresses',
}

//TODO: add links to the spec defining the structure of the base64 encoded strings
export type HederaJsonRpcMethodRequestParam = {
  [HederaJsonRpcMethod.SignTransactionBody]: {
    transactionBody: string
  }
  [HederaJsonRpcMethod.SignTransactionAndSend]: {
    signedTransaction: string
  }
  [HederaJsonRpcMethod.SendTransactionOnly]: {
    signedTransaction: string
  }
  [HederaJsonRpcMethod.SignQueryAndSend]: {
    query: string
  }
  [HederaJsonRpcMethod.SignMessage]: {
    message: string
  }
  [HederaJsonRpcMethod.GetNodeAddresses]: {}
}

export type HederaJsonRpcMethodResponse = {
  [HederaJsonRpcMethod.SignTransactionBody]: {
    signatureMap: string
  }
  [HederaJsonRpcMethod.SignTransactionAndSend]: {
    precheckCode: number
  }
  [HederaJsonRpcMethod.SendTransactionOnly]: {
    precheckCode: number
  }
  [HederaJsonRpcMethod.SignQueryAndSend]: {
    response: string
  }
  [HederaJsonRpcMethod.SignMessage]: {
    signatureMap: string
  }
  [HederaJsonRpcMethod.GetNodeAddresses]: {
    nodes: string[]
  }
}
export default HederaJsonRpcMethod
