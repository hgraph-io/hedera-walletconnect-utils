import { Core } from '@walletconnect/core'
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
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
} from '../shared'
import Provider from './provider'
import type { HederaNativeWallet } from './wallet'
import { Buffer } from 'buffer'
import { keccak256 } from 'web3-utils'

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
  public buildAndApproveSession(
    accounts: string[],
    { id, params }: Web3WalletTypes.SessionProposal,
  ) {
    // just get unique chains
    const chains = accounts
      .map((account) => account.split(':').slice(0, 2).join(':'))
      .filter((x, i, a) => a.indexOf(x) == i)

    this.approveSession({
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
  parseSessionRequest(event: Web3WalletTypes.SessionRequest): {
    id: number
    topic: string
    chainId: HederaChainId
    method: HederaJsonRpcMethod
    transaction?: Transaction
    query?: Query<any>
    requestParams: any
    accountId?: AccountId
    body: any
  } {
    const { id, topic } = event
    const {
      request: { method, params: requestParams },
      chainId,
    } = event.params

    let transaction: Transaction | undefined

    const methodsWithTransaction = [
      HederaJsonRpcMethod.SendTransactionOnly,
      HederaJsonRpcMethod.SignTransactionAndSend,
      HederaJsonRpcMethod.SignTransactionBody,
      HederaJsonRpcMethod.SignTransactionAndSend,
    ]

    if (methodsWithTransaction.includes(method as HederaJsonRpcMethod)) {
      transaction = base64StringToTransaction(requestParams[0])
    }

    const accountId = transaction?.transactionId?.accountId!

    let query: Query<any> | undefined

    if ((method as HederaJsonRpcMethod) === HederaJsonRpcMethod.SignQueryAndSend) {
      query = base64StringToQuery(requestParams[0])
    }

    const body = transaction ?? query ?? requestParams

    return {
      id,
      topic,
      chainId: chainId as HederaChainId,
      method: method as HederaJsonRpcMethod,
      transaction,
      query,
      accountId,
      requestParams,
      body,
    }
  }

  async executeSessionRequest(
    event: Web3WalletTypes.SessionRequest,
    hederaWallet: HederaWallet,
  ): Promise<void> {
    const { id, topic, method, body } = this.parseSessionRequest(event)

    return this[method](id, topic, body, hederaWallet)
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
    const hederaResponse = await signer.call(body)
    return this.respondSessionRequest({
      topic,
      response: { id, result: hederaResponse, jsonrpc: '2.0' },
    })
  }

  public async hedera_signTransactionAndSend(
    id: number,
    topic: string,
    body: Transaction, // can be signedTransaction or not signedTransaction
    signer: HederaWallet,
  ): Promise<void> {
    const hederaResponse = await signer.call(await signer.signTransaction(body))
    return this.respondSessionRequest({
      topic,
      response: { id, result: hederaResponse, jsonrpc: '2.0' },
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
    body: any,
    signer: HederaWallet,
  ): Promise<void> {
    // fee is $0.0001
    // Create the query
    // The mainnet address book file ID on mainnet is 0.0.102
    const fileQuery = new FileContentsQuery().setFileId(FileId.fromString('0.0.102'))

    // Sign with the operator private key and submit to a Hedera network
    const contents = await fileQuery.executeWithSigner(signer)
    const mainnetNodeAdressBook = Buffer.from(contents).toString('utf-8')

    return this.respondSessionRequest({
      topic,
      response: { id, result: mainnetNodeAdressBook, jsonrpc: '2.0' },
    })
  }

  public async hedera_signMessage(
    id: number,
    topic: string,
    messages: any,
    signer: HederaWallet,
  ): Promise<void> {
    const hederaMessages = messages.map((messageBase64: string) => {
      const message = Buffer.from(messageBase64, 'base64').toString('utf-8')
      const hederaMessage = keccak256('\x19Hedera Signed Message:\n' + message.length + message)
      const hederaMessageUInt8 = Uint8Array.from(Buffer.from(hederaMessage, 'hex'))

      return hederaMessageUInt8
    })

    const signerSignatures = await signer.sign(hederaMessages)
    const signaturesBase64 = signerSignatures.map((signerSignature) =>
      Buffer.from(signerSignature.signature).toString('base64'),
    )

    return this.respondSessionRequest({
      topic,
      response: { id, result: signaturesBase64, jsonrpc: '2.0' },
    })
  }

  // Unified flex version
  public async hedera_signQueryAndSend(
    id: number,
    topic: string,
    body: Query<any>,
    signer: HederaWallet,
  ): Promise<void> {
    const hederaResponse = await body.executeWithSigner(signer)
    let data: any = hederaResponse
    let isBinaryBase64Data = false

    if (hederaResponse instanceof ArrayBuffer || hederaResponse instanceof Uint8Array) {
      data = Buffer.from(hederaResponse).toString('base64')
      isBinaryBase64Data = true
    }

    const response = {
      data,
      isBinaryBase64Data,
    }

    return this.respondSessionRequest({
      topic,
      response: {
        id,
        result: Buffer.from(JSON.stringify(response)).toString('base64'),
        jsonrpc: '2.0',
      },
    })
  }
}
