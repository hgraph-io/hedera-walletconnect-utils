import type { Web3WalletTypes } from '@walletconnect/types'
import type { IWeb3Wallet } from '@walletconnect/web3wallet'
import type { Transaction, Wallet as HederaWallet } from '@hashgraph/sdk'
import type { HederaJsonRpcMethod as Method } from '../shared'

export interface HederaNativeWallet {
  // [Method.GetNodeAddresses](): Promise<string[]>

  [Method.SendTransactionOnly](
    id: number,
    topic: string,
    body: Transaction,
    signer: HederaWallet,
  ): Promise<void>

  // [Method.SignMessage](message: string): Promise<string> // signatureMap

  // [Method.SignQueryAndSend](query: string): Promise<string> // queryResponse

  [Method.SignTransactionAndSend](
    id: number,
    topic: string,
    body: Transaction,
    signer: HederaWallet,
  ): Promise<void>

  [Method.SignTransactionBody](
    id: number,
    topic: string,
    body: Transaction,
    signer: HederaWallet,
  ): Promise<void>
}

// placeholder for EIP:155 support
export interface HederaEvmCompatibleWallet {}
