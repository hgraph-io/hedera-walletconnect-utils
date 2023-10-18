import { Client, Transaction, PrivateKey, AccountId, ClientNetworkName } from '@hashgraph/sdk'
import {
  HederaSignAndExecuteTransactionResponse,
  HederaSignAndReturnTransactionResponse,
  HederaSignMessageResponse,
} from '../types'

type HederaWalletOptions = {
  accountId: AccountId
  privateKey: PrivateKey
  network: ClientNetworkName
}

type InitOptions = {
  accountId: ConstructorParameters<typeof AccountId>[0] | string
  privateKey: string
  network: ClientNetworkName
}

export class HederaWallet {
  private _client: Client
  private _accountId: AccountId
  private _privateKey: PrivateKey
  public readonly network: string

  public constructor({ accountId, privateKey, network }: HederaWalletOptions) {
    this._accountId = accountId
    this._privateKey = privateKey
    this._client = this._initClient({ accountId, privateKey, network })
    this.network = network
  }

  private _initClient({ accountId, privateKey, network }: HederaWalletOptions) {
    const client = Client.forName(network) // throws if network is invalid
    client.setOperator(accountId, privateKey)
    return client
  }

  /**
   * A convenience wrapper for the `HederaWallet` constructor. If more control over the `accountId`
   * and `privateKey` values are needed, the requisite parameters can be built and passed directly
   * to the class's constructor.
   *
   * InitOptions:
   * - `accountId`: The "account" portion of a Hedera address `{shardNum}.{realmNum}.{account}` - e.g. 1234 from "0.0.1234"
   * - `privateKey`: A hex-encoded string. Requires DER header
   * - `network`: One of "mainnet", "previewnet", or "testnet"
   *
   * @param options - InitOptions
   * @returns HederaWallet instance
   * @example
   * ```js
   * const wallet = HederaWallet.init({
   *   network: 'mainnet',
   *   accountId: 12345, // or '0.0.12345'
   *   privateKey: securelyFetchPrivateKey(), // '30300201...',
   * })
   * ```
   */
  public static init({ accountId, privateKey, network }: InitOptions) {
    // If `accountId` is a string, attempt to pop the "account" portion from the address
    const accountEntityId =
      typeof accountId === 'string' ? Number(accountId.split('.').pop()) : accountId

    if (!accountEntityId) {
      throw new Error(`Unable to determine account number from accountId: ${accountId}`)
    }

    return new HederaWallet({
      network,
      accountId: new AccountId(accountEntityId),
      privateKey: PrivateKey.fromString(privateKey),
    })
  }

  public get accountId() {
    return this._accountId
  }

  public get client() {
    return this._client
  }

  public async signAndExecuteTransaction(
    transaction: Transaction,
  ): Promise<HederaSignAndExecuteTransactionResponse> {
    const signedTransaction = await transaction.sign(this._privateKey)
    const response = await signedTransaction.execute(this._client)
    const receipt = await response.getReceipt(this._client)
    return {
      response: response.toJSON(),
      receipt,
    }
  }

  public async signAndReturnTransaction(
    transaction: Transaction,
  ): Promise<HederaSignAndReturnTransactionResponse> {
    const signedTransaction = await transaction.sign(this._privateKey)
    const signedTransactionBytes = signedTransaction.toBytes()
    const encodedTransactionBytes = Buffer.from(signedTransactionBytes).toString('base64')
    return {
      signerAccountId: this._accountId.toString(),
      transaction: {
        bytes: encodedTransactionBytes,
      },
    }
  }

  public signMessages(bytes: string[]): HederaSignMessageResponse {
    return {
      signatures: bytes.map((bytes) => {
        const buf = Buffer.from(bytes, 'base64')
        const signedMessage = this._privateKey.sign(buf)
        return Buffer.from(signedMessage).toString('base64')
      }),
    }
  }
}
