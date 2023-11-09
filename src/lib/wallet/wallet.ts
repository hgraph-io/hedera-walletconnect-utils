import type { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Transaction } from '@hashgraph/sdk'

import { HederaJsonRpcMethod as Method } from '../shared'

export interface HederaWalletConnectWallet {
  init(metadata: {}, hederaWalletArgs: { accountId: string; privateKey: string }): Promise<void>
  pair: IWeb3Wallet['pair']
}

export interface HederaNativeWallet {
  approveJsonRpcMethodRequest(transaction: Transaction): Promise<boolean>

  [Method.GetNodeAddresses](): Promise<string[]>

  [Method.SendTransactionOnly](signedTransaction: string): Promise<number> // precheckCode

  [Method.SignMessage](message: string): Promise<string> // signatureMap

  [Method.SignQueryAndSend](query: string): Promise<string> // queryResponse

  [Method.SignTransactionAndSend](signedTransaction: string): Promise<number> // precheckCode

  [Method.SignTransactionBody](signedTransaction: string): Promise<string> // signatureMap
}

// placeholder for EIP:155 support
export interface HederaEvmCompatibleWallet {}
