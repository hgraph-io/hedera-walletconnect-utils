import { Core } from '@walletconnect/core'
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { SessionTypes } from '@walletconnect/types'
import { buildApprovedNamespaces } from '@walletconnect/utils'
import { Wallet as HederaWallet, Client, AccountId, Transaction, Query } from '@hashgraph/sdk'
import {
  HederaChainId,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  base64StringToTransaction,
  transactionToBase64String,
  base64StringToQuery,
  base64StringToMessage,
  EthereumJsonRpcMethod,
  EthereumChainId,
  JsonRPCMethod,
} from '../shared'
import Provider from './provider'
import type { HederaNativeWallet } from './types'

// https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/web3wallet/src/client.ts
export default class Wallet extends Web3Wallet implements HederaNativeWallet {
  /*
   * Set default values for chains, methods, events
   */
  constructor(
    opts: Web3WalletTypes.Options,
    public chains: {
      [namespace: string]: string[]
    } = {
      hedera: Object.values(HederaChainId),
      eip155: Object.values(EthereumChainId),
    },
    public methods: {
      [namespace: string]: string[]
    } = {
      hedera: Object.values(HederaJsonRpcMethod),
      eip155: Object.values(EthereumJsonRpcMethod),
    },
    public sessionEvents: HederaSessionEvent[] | string[] = Object.values(HederaSessionEvent),
  ) {
    super(opts)
  }

  // wrapper to reduce needing to instantiate Core object on client, also add hedera sensible defaults
  static async create(
    projectId: string,
    metadata: Web3WalletTypes.Metadata,
    chains?: {
      [namespace: string]: string[]
    },
    methods?: {
      [namespace: string]: string[]
    },
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
    accounts: {
      [key: string]: string[]
    },
    { id, params }: Web3WalletTypes.SessionProposal,
  ): Promise<SessionTypes.Struct> {

    let namespaces: Record<string, {
      chains: string[];
      methods: string[];
      events: string[];
      accounts: string[];
    }> = {};

    Object.keys(accounts)
      .forEach(accountsKey => {
        const chains = accounts[accountsKey]
          .map((account) => account.split(':').slice(0, 2).join(':'))
          // filter to get unique chains
          .filter((x, i, a) => a.indexOf(x) == i)

        const namespace = {
          chains,
          methods: this.methods[accountsKey],
          events: this.sessionEvents,
          accounts: accounts[accountsKey],
        }

        namespaces[accountsKey] = namespace;
      })

    return await this.approveSession({
      id,
      namespaces: buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          ...namespaces
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
    method: JsonRPCMethod
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
    // get account id from optional second param for transactions and queries or from transaction id
    // this allows for the case where the requested signer is not the payer, but defaults to the payer if a second param is not provided
    let accountId: AccountId | undefined
    // method without chain prefix
    let jsonRpcMethod: JsonRPCMethod | undefined

    try {
      switch (method) {
        case HederaJsonRpcMethod.GetNodeAddresses:
          jsonRpcMethod = JsonRPCMethod.GetNodeAddresses;
          break
        case HederaJsonRpcMethod.SignMessage:
        case EthereumJsonRpcMethod.Sign:
          body = base64StringToMessage(params[0])
          accountId = params[1] ? AccountId.fromString(params[1]) : undefined
          jsonRpcMethod = JsonRPCMethod.SignMessage;
          break
        case HederaJsonRpcMethod.SignQueryAndSend:
          body = base64StringToQuery(params[0])
          accountId = params[1] ? AccountId.fromString(params[1]) : undefined
          jsonRpcMethod = JsonRPCMethod.SignQueryAndSend;
          break
        case HederaJsonRpcMethod.SendTransactionOnly:
        case EthereumJsonRpcMethod.SendRawTransaction:
          jsonRpcMethod = JsonRPCMethod.SendTransactionOnly;
        case HederaJsonRpcMethod.SignTransactionAndSend:
        case EthereumJsonRpcMethod.SendTransaction:
          if (!jsonRpcMethod) jsonRpcMethod = JsonRPCMethod.SignTransactionAndSend;
        case HederaJsonRpcMethod.SignTransactionBody:
        case EthereumJsonRpcMethod.SignTransaction:
          if (!jsonRpcMethod) jsonRpcMethod = JsonRPCMethod.SignTransactionBody;
          body = base64StringToTransaction(params[0])
          accountId = params[1]
            ? AccountId.fromString(params[1])
            : body.transactionId?.accountId || undefined
          break
        default:
          throw new Error('Invalid Hedera WalletConnect method')
      }
      // error parsing request params
    } catch (e) {
      if (shouldThrow) throw e
    }

    // if we passed ethereum chainId we need to proxy it to Hedera analogic chain
    let hederaChainId: HederaChainId = method as HederaChainId

    try {
      switch (chainId) {
        case EthereumChainId.Testnet:
          hederaChainId = HederaChainId.Testnet
          break
        case EthereumChainId.Mainnet:
          hederaChainId = HederaChainId.Mainnet
          break
      }
    } catch (e) {
      if (shouldThrow) throw e
    }

    return {
      method: jsonRpcMethod as JsonRPCMethod,
      chainId: hederaChainId,
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

    return await this[method](id, topic, body, hederaWallet)
  }

  // https://docs.walletconnect.com/web3wallet/wallet-usage#responding-to-session-requests
  public async rejectSessionRequest(
    event: Web3WalletTypes.SessionRequest,
    error: { code: number; message: string },
  ): Promise<void> {
    const { id, topic } = this.parseSessionRequest(event, false)

    return await this.respondSessionRequest({
      topic,
      response: { id, error, jsonrpc: '2.0' },
    })
  }

  /*
   * JSON RPC Methods
   */
  public async sendTransactionOnly(
    id: number,
    topic: string,
    body: Transaction, // must be signedTransaction
    signer: HederaWallet,
  ): Promise<void> {
    const result = await signer.call(body)

    return await this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  public async signTransactionAndSend(
    id: number,
    topic: string,
    body: Transaction, // can be signed or unsigned
    signer: HederaWallet,
  ): Promise<void> {
    const result = await signer.call(await signer.signTransaction(body))

    return await this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  public async signTransactionBody(
    id: number,
    topic: string,
    body: Transaction,
    signer: HederaWallet,
  ): Promise<void> {
    const result = transactionToBase64String(await signer.signTransaction(body))

    return await this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  public async getNodeAddresses(
    id: number,
    topic: string,
    _: any, // ignore this param to be consistent call signature with other functions
    signer: HederaWallet,
  ): Promise<void> {
    const result = signer.getNetwork()

    return await this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  // TODO: PR/ discussion into HIP for array of messages
  public async signMessage(
    id: number,
    topic: string,
    body: Uint8Array[],
    signer: HederaWallet,
  ): Promise<void> {
    const result = await signer.sign(body)

    return await this.respondSessionRequest({
      topic,
      response: { id, result, jsonrpc: '2.0' },
    })
  }

  public async signQueryAndSend(
    id: number,
    topic: string,
    body: Query<any>,
    signer: HederaWallet,
  ): Promise<void> {
    const result = await body.executeWithSigner(signer)

    return await this.respondSessionRequest({
      topic,
      response: {
        id,
        result,
        jsonrpc: '2.0',
      },
    })
  }
}
