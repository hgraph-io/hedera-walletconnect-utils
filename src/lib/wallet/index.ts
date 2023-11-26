import { Core } from '@walletconnect/core'
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { SessionTypes } from '@walletconnect/types'
import { buildApprovedNamespaces } from '@walletconnect/utils'
import {
  Wallet as HederaWallet,
  Client,
  AccountId,
  FileId,
  FileContentsQuery,
  Transaction,
  Query,
} from '@hashgraph/sdk'
import {
  HederaChainId,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  base64StringToTransaction,
  transactionToBase64String,
  base64StringToQuery,
  base64StringToMessage,
} from '../shared'
import Provider from './provider'
import type { HederaNativeWallet } from './wallet'

// https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/web3wallet/src/client.ts
export default class Wallet extends Web3Wallet implements HederaNativeWallet {
  /*
   * Set default values for chains, methods, events
   */
  constructor(
    opts: Web3WalletTypes.Options,
    public chains: HederaChainId[] | string[] = Object.values(HederaChainId),
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
    chainId: HederaChainId,
    accountId: AccountId | string,
    privateKey: string,
    _provider?: Provider,
  ): HederaWallet {
    const network = chainId.split(':')[1]
    const client = Client.forName(network)
    const provider = _provider ?? new Provider(client)
    return new HederaWallet(accountId, privateKey, provider)
  }

  /*
   * Session proposal
   */
  public async buildAndApproveSession(
    accounts: string[],
    { id, params }: Web3WalletTypes.SessionProposal,
  ): Promise<SessionTypes.Struct> {
    // filter to get unique chains
    const chains = accounts
      .map((account) => account.split(':').slice(0, 2).join(':'))
      .filter((x, i, a) => a.indexOf(x) == i)

    return this.approveSession({
      id,
      namespaces: buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          hedera: {
            chains,
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
  public parseSessionRequest(
    event: Web3WalletTypes.SessionRequest,
    // optional arg to throw error if request is invalid, call with shouldThrow = false when calling from rejectSessionRequest as we only need id and top to send reject response
    shouldThrow = true,
  ): {
    method: HederaJsonRpcMethod
    chainId: HederaChainId
    id: number // session request id
    topic: string // session topic
    body?: Transaction | Query<any> | Uint8Array[] | undefined
    accountId?: AccountId
  } {
    const { id, topic } = event
    const {
      request: { method, params },
      chainId,
    } = event.params

    let body: Transaction | Query<any> | Uint8Array[] | undefined
    let accountId: AccountId | undefined
    try {
      switch (method) {
        case HederaJsonRpcMethod.GetNodeAddresses:
          break
        case HederaJsonRpcMethod.SignMessage:
          body = base64StringToMessage(params[0])
          accountId = params[1] ? AccountId.fromString(params[1]) : undefined
          break
        case HederaJsonRpcMethod.SignQueryAndSend:
          body = base64StringToQuery(params[0])
          break
        case HederaJsonRpcMethod.SendTransactionOnly:
        case HederaJsonRpcMethod.SignTransactionAndSend:
        case HederaJsonRpcMethod.SignTransactionBody:
          body = base64StringToTransaction(params[0])
          // get account id from optional second param or from transaction id
          // this allows for the case where the requested signer is not the payer, but defaults to the payer if a second param is not provided
          accountId = params[1]
            ? AccountId.fromString(params[1])
            : body.transactionId?.accountId || undefined
          break
        default:
          throw new Error('Invalid Hedera WalletConnect method')
      }
    } catch (e) {
      // error parsing request params
      if (shouldThrow) throw e
      console.error(e)
    }

    return {
      method: method as HederaJsonRpcMethod,
      chainId: chainId as HederaChainId,
      id,
      topic,
      body,
      accountId,
    }
  }

  public async executeSessionRequest(
    event: Web3WalletTypes.SessionRequest,
    hederaWallet: HederaWallet,
  ): Promise<void> {
    const { method, id, topic, body } = this.parseSessionRequest(event)

    return this[method](id, topic, body, hederaWallet)
  }

  // https://docs.walletconnect.com/web3wallet/wallet-usage#responding-to-session-requests
  public async rejectSessionRequest(
    event: Web3WalletTypes.SessionRequest,
    error: { code: number; message: string },
  ): Promise<void> {
    const { id, topic } = this.parseSessionRequest(event, false)
    return this.respondSessionRequest({
      topic,
      response: { id, error, jsonrpc: '2.0' },
    })
  }

  /*
   * JSON RPC Methods
   */
  public async hedera_sendTransactionOnly(
    id: number,
    topic: string,
    body: Transaction, // must be signedTransaction
    signer: HederaWallet,
  ): Promise<void> {
    const result = await signer.call(body)

    return this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  public async hedera_signTransactionAndSend(
    id: number,
    topic: string,
    body: Transaction, // can be signed or unsigned
    signer: HederaWallet,
  ): Promise<void> {
    const result = await signer.call(await signer.signTransaction(body))

    return this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  public async hedera_signTransactionBody(
    id: number,
    topic: string,
    body: Transaction,
    signer: HederaWallet,
  ): Promise<void> {
    const result = transactionToBase64String(await signer.signTransaction(body))
    return this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  public async hedera_getNodeAddresses(
    id: number,
    topic: string,
    _: any, // ignore this param to be consistent call signature with other functions
    signer: HederaWallet,
  ): Promise<void> {
    const fileQuery = new FileContentsQuery().setFileId(FileId.fromString('0.0.102')) // TODO: filequery for other networks
    const result = await fileQuery.executeWithSigner(signer)

    return this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  // TODO: PR/ discussion into HIP for array of messages
  public async hedera_signMessage(
    id: number,
    topic: string,
    body: Uint8Array[],
    signer: HederaWallet,
  ): Promise<void> {
    const result = await signer.sign(body)

    return this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  // Unified flex version
  public async hedera_signQueryAndSend(
    id: number,
    topic: string,
    body: Query<any>,
    signer: HederaWallet,
  ): Promise<void> {
    const result = await body.executeWithSigner(signer)

    return this.respondSessionRequest({
      topic,
      response: {
        id,
        result,
        jsonrpc: '2.0',
      },
    })
  }
}
