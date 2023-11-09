import { HederaJsonRpcMethod as Method } from '../shared'

//TODO: types on any
export interface HederaWalletConnectWallet {
  init(metadata: {}, hederaWalletArgs: { accountId: string; privateKey: string }): Promise<void>
}

export interface HederaNativeWallet {
  [Method.GetNodeAddresses](): Promise<string[]>

  [Method.SendTransactionOnly](signedTransaction: string): Promise<number> // precheckCode

  [Method.SignMessage](message: string): Promise<string> // signatureMap

  [Method.SignQueryAndSend](query: string): Promise<string> // queryResponse

  [Method.SignTransactionAndSend](signedTransaction: string): Promise<number> // precheckCode

  [Method.SignTransactionBody](signedTransaction: string): Promise<string> // signatureMap
}
