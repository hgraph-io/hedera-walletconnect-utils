import type { Web3WalletTypes } from '@walletconnect/types'
import type { JsonRpcResponse } from '@walletconnect/jsonrpc-utils'
import type { IWeb3Wallet } from '@walletconnect/web3wallet'
import type { Transaction, Wallet as HederaWallet } from '@hashgraph/sdk'
import type { HederaJsonRpcMethod as Method } from '../shared'

export interface HederaNativeWallet {
  // [Method.GetNodeAddresses](): Promise<string[]>

  // [Method.SendTransactionOnly](signedTransaction: string): Promise<number> // precheckCode

  // [Method.SignMessage](message: string): Promise<string> // signatureMap

  // [Method.SignQueryAndSend](query: string): Promise<string> // queryResponse

  [Method.SignTransactionAndSend](
    id: number,
    body: { signedTransaction: Transaction },
    signer: HederaWallet,
  ): Promise<void> // precheckCode

  // [Method.SignTransactionBody](signedTransaction: string): Promise<string> // signatureMap
}

// placeholder for EIP:155 support
export interface HederaEvmCompatibleWallet {}
