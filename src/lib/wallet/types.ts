import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { SessionTypes } from '@walletconnect/types'
import type { Transaction, Query, AccountId, Wallet as HederaWallet } from '@hashgraph/sdk'
import type { HederaChainId, JsonRPCMethod } from '../shared'
import type Provider from './provider'

export interface HederaNativeWallet {
  /*
   * Session helpers
   */
  buildAndApproveSession(
    accounts: {
      [key: string]: string[]
    },
    { id, params }: Web3WalletTypes.SessionProposal,
  ): Promise<SessionTypes.Struct>

  parseSessionRequest(
    event: Web3WalletTypes.SessionRequest,
    shouldThrow: boolean,
  ): {
    method: JsonRPCMethod
    chainId: HederaChainId
    id: number // session request id
    topic: string // session topic
    body?: Transaction | Query<any> | Uint8Array[] | undefined
    accountId?: AccountId
  }

  executeSessionRequest(
    event: Web3WalletTypes.SessionRequest,
    hederaWallet: HederaWallet,
  ): Promise<void>

  rejectSessionRequest(
    event: Web3WalletTypes.SessionRequest,
    error: { code: number; message: string },
  ): Promise<void>

  /*
   * Hedera wallet helper
   */
  getHederaWallet(
    chainId: HederaChainId,
    accountId: AccountId | string,
    privateKey: string,
    _provider?: Provider,
  ): HederaWallet

  /*
   * JSON-RPC methods
   */
  [JsonRPCMethod.GetNodeAddresses](
    id: number,
    topic: string,
    _: any, // ignore this param to be consistent call signature with other functions
    signer: HederaWallet,
  ): Promise<void>

  [JsonRPCMethod.SendTransactionOnly](
    id: number,
    topic: string,
    body: Transaction,
    signer: HederaWallet,
  ): Promise<void>

  [JsonRPCMethod.SignMessage](
    id: number,
    topic: string,
    body: Uint8Array[],
    signer: HederaWallet,
  ): Promise<void>

  [JsonRPCMethod.SignQueryAndSend](
    id: number,
    topic: string,
    body: Query<any>,
    signer: HederaWallet,
  ): Promise<void>

  [JsonRPCMethod.SignTransactionAndSend](
    id: number,
    topic: string,
    body: Transaction,
    signer: HederaWallet,
  ): Promise<void>

  [JsonRPCMethod.SignTransactionBody](
    id: number,
    topic: string,
    body: Transaction,
    signer: HederaWallet,
  ): Promise<void>
}

// placeholder for EIP:155 support
export interface HederaEvmCompatibleWallet {}
