import type {
  TransactionResponse,
  TransactionReceipt,
  TransactionRecord,
  AccountId,
} from '@hashgraph/sdk'

/*
 * Transactions
 */
export type HederaTransactionRequest = {
  signerAccountId: string // format of <shard>.<realm>.<account>, i.e. 0.0.12345
  transaction: {
    bytes: string // should be a base64 encoded Uint8Array
  }
  getReceipt?: boolean // defaults to true
  getRecord?: boolean // defaults to false
}

export type HederaTransactionResponse = {
  response: TransactionResponse
  receipt?: TransactionReceipt
  record?: TransactionRecord
}

/*
 * Queries
 */

/*
 * Messages
 */

export type HederaSignMessageRequest = {
  signerAccountId: string
  messages: string[] // base64 encoded string Uint8Array
}

export type HederaSignMessageResponse = {
  signedMessages: string[]
}

/*
 * Get node addresses
 */
export type HederaGetNodeAddressesResponse = {
  consensus: { [key: string]: string | AccountId } // {hostname:port: AccountId}
  mirror: string[] // string['hostname:port']
}
