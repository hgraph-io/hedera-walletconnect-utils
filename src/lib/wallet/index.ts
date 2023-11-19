import { Core } from '@walletconnect/core'
// import type { JsonRpcResponse } from '@walletconnect/jsonrpc-utils'
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces } from '@walletconnect/utils'
import { Wallet as HederaWallet, Client, Transaction } from '@hashgraph/sdk'
import {
  HederaChainId,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  base64StringToTransaction,
} from '../shared'
import Provider from './provider'
import { type HederaNativeWallet } from './wallet'

// https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/web3wallet/src/client.ts
export default class Wallet extends Web3Wallet implements HederaNativeWallet {
  /*
   * Set default values for chains, methods, events
   */
  constructor(
    opts: Web3WalletTypes.Options,
    public chains: HederaChainId[] | string[] = [HederaChainId.Mainnet, HederaChainId.Testnet],
    public methods: string[] = Object.values(HederaJsonRpcMethod),
    public sessionEvents: HederaSessionEvent[] | string[] = Object.values(HederaSessionEvent),
  ) {
    super(opts)
  }

  // wrapper to reduce needing to instantiate Core object on client, also add hedera sensible defaults
  static async create(
    projectId: string,
    metadata: Web3WalletTypes.Metadata,
    chains?: HederaChainId[],
    methods?: string[],
    sessionEvents?: HederaSessionEvent[] | string[],
  ) {
    const wallet = new Wallet(
      { core: new Core({ projectId }), metadata },
      chains,
      methods,
      sessionEvents,
    )

    //https://github.com/WalletConnect/walletconnect-monorepo/blob/14f54684c3d89a5986a68f4dd700a79a958f1604/packages/web3wallet/src/client.ts#L178
    wallet.logger.trace(`Initialized`)
    try {
      await wallet.engine.init()
      wallet.logger.info(`Web3Wallet Initialization Success`)
    } catch (error: any) {
      wallet.logger.info(`Web3Wallet Initialization Failure`)
      wallet.logger.error(error.message)
      throw error
    }

    return wallet
  }

  /*
   * Hedera Wallet Signer
   */
  public getHederaWallet(
    account: string,
    privateKey: string,
    _provider?: Provider,
  ): HederaWallet {
    const split = account.split(':')
    const network = split[1]
    const accountId = split[2]
    const client = Client.forName(network)
    const provider = _provider ?? new Provider(client)
    return new HederaWallet(accountId, privateKey, provider)
  }

  /*
   * Session proposal
   */
  public buildAndApproveSession(
    accounts: string[],
    { id, params }: Web3WalletTypes.SessionProposal,
  ) {
    this.approveSession({
      id,
      namespaces: buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          hedera: {
            chains: this.chains,
            methods: this.methods,
            events: this.sessionEvents,
            accounts,
          },
        },
      }),
    })
  }

  /*
   *  Session Requests
   */
  parseSessionRequest(event: Web3WalletTypes.SessionRequest): {
    id: number
    method: HederaJsonRpcMethod
    body: Transaction
    account: string
  } {
    const method = event.params.request.method as HederaJsonRpcMethod
    // Could be signed or unsigned transaction
    const body = base64StringToTransaction(event.params.request.params[0])
    const account = event.params.request.params[1] //|| wallet.getAccounts()[0]
    const id = event.id
    return { id, method, body, account }
  }

  async executeSessionRequest(
    event: Web3WalletTypes.SessionRequest,
    hederaWallet: HederaWallet,
  ): Promise<void> {
    const { id, method, body }: { id: number; method: HederaJsonRpcMethod; body: Transaction } =
      this.parseSessionRequest(event)
    return this[method](id, body, hederaWallet)
  }

  /*
   * JSON RPC Methods
   */
  public async hedera_signTransactionAndSend(
    id: number,
    body: Transaction, // can be signedTransaction or not signedTransaction
    signer: HederaWallet,
  ): Promise<void> {
    const hederaResponse = await signer.call(
      await signer.signTransaction(body),
    )
    return this.respondSessionRequest({
      topic: '123',
      response: { id, result: hederaResponse, jsonrpc: '2.0' },
    })
  }
}
