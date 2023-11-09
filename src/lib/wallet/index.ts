import type {
  ICore as IWalletConnectCore,
  CoreTypes as WalletConnectCoreTypes,
} from '@walletconnect/types'
import {
  Web3Wallet as WalletConnectWallet,
  IWeb3Wallet,
  Web3WalletTypes,
} from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { Wallet as HederaWallet, Client, LocalProvider, Transaction } from '@hashgraph/sdk'
import {
  HederaChainId,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  HEDERA_JSON_RPC_PREFIX,
  base64StringToTransaction,
} from '../shared'

import type { HederaNativeWallet, HederaWalletConnectWallet } from './wallet'

/*
 * Mark as abstract to force the implementer to implement the abstract methods
 */
export default abstract class HederaNativeWalletConnectWallet
  implements HederaWalletConnectWallet, HederaNativeWallet
{
  abstract walletConnectCore: IWalletConnectCore
  abstract supportedHederaNetworks: HederaChainId[]
  abstract walletConnectMetadata: WalletConnectCoreTypes.Metadata

  // method to have wallet approve accounts
  abstract approveAccounts(): Promise<string[]>
  //TODO: should the wallet be able to modify the transaction as well?
  abstract approveJsonRpcMethodRequest(transaction: Transaction): Promise<boolean>

  public walletConnectWallet?: IWeb3Wallet
  public hederaWallet?: HederaWallet
  public session: unknown

  /*
   * Step 1: Initialize the HederaWallet with the appropriate metadata
   */
  async init(hederaWalletArgs: {
    accountId: string
    privateKey: string
    network: 'forMainnet' | 'forTestnet' | 'forPreviewnet' | 'forLocalNode'
  }) {
    // WalletConnect
    this.walletConnectWallet = await WalletConnectWallet.init({
      core: this.walletConnectCore,
      metadata: this.walletConnectMetadata,
    })

    // set up event listeners
    this.walletConnectWallet.on('session_proposal', this.handleSessionProposal)

    // init Hedera Wallet
    const client = Client[hederaWalletArgs.network]()
    const provider = new LocalProvider({ client })
    this.hederaWallet = new HederaWallet(
      hederaWalletArgs.accountId,
      hederaWalletArgs.privateKey,
      provider,
    )
  }

  /*
   * Step 2: user the pairing string from the dApp to pair the wallet
   */
  pair(params: { uri: string; activatePairing?: boolean }) {
    if (!this.walletConnectWallet) throw new Error('WalletConnectWallet not initialized')
    return this.walletConnectWallet.pair(params)
  }

  /*
   * Step 2.1:  handleSessionProposal
   *  - a `session_proposal` event is fired upon pairing
   *  - decide which accounts to approve, (i.e. get feedback from user)
   */
  async handleSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
    try {
      const accounts = await this.approveAccounts()
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          hedera: {
            chains: this.supportedHederaNetworks,
            methods: Object.values(HederaJsonRpcMethod).map(
              (method) => `${HEDERA_JSON_RPC_PREFIX}${method}`,
            ),
            events: Object.values(HederaSessionEvent),
            accounts,
          },
        },
      })
      //TODO: can we have more than 1 session?
      this.session = this.walletConnectWallet?.approveSession({
        id,
        namespaces: approvedNamespaces,
      })
    } catch (error) {
      // use the error.message to show toast/info-box letting the user know that the connection attempt was unsuccessful
      this.walletConnectWallet?.rejectSession({
        id,
        reason: getSdkError('USER_REJECTED'),
      })
    }
  }

  /*
   *  Session Requests
   */
  async handleSessionRequest(): Promise<any> {
    throw new Error('not implemented')
  }

  async validateRequest(): Promise<any> {
    throw new Error('not implemented')
  }

  async buildAndSendResponse(): Promise<any> {
    throw new Error('not implemented')
  }

  /*
   * JSON RPC Methods
   */
  async getNodeAddresses(): Promise<string[]> {
    throw new Error('not implemented')
  }

  async sendTransactionOnly(signedTransaction: string): Promise<number> {
    throw new Error('not implemented')
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('not implemented')
  }

  async signQueryAndSend(query: string): Promise<string> {
    throw new Error('not implemented')
  }

  async signTransactionAndSend(signedTransaction: string): Promise<number> {
    const transaction = base64StringToTransaction(signedTransaction)
    if (await this.approveJsonRpcMethodRequest(transaction)) {
      const wallet = this.hederaWallet!
      const signedTransaction = await wallet.signTransaction(transaction)
      const response = await wallet.call(signedTransaction)
      console.log(response)
    }

    throw new Error('not implemented')
  }

  async signTransactionBody(signedTransaction: string): Promise<string> {
    throw new Error('not implemented')
  }
}
