import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { Wallet as HederaWallet, Transaction } from '@hashgraph/sdk'
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
  abstract supportedHederaNetworks: HederaChainId[]
  abstract addApprovedAccounts(): Promise<string[]>
  abstract approveJsonRpcMethodRequest(transaction: Transaction): Promise<boolean>
  abstract init(projectId: string, metadata: Web3WalletTypes.Metadata): Promise<void>

  public walletConnectWallet?: IWeb3Wallet
  public hederaWallet?: HederaWallet
  public session: unknown

  // pairing request
  pair(params: { uri: string; activatePairing?: boolean }) {
    if (!this.walletConnectWallet) throw new Error('WalletConnectWallet not initialized')
    return this.walletConnectWallet.pair(params)
  }

  // session proposal
  async handleSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
    // TODO: what if there's already a session?
    try {
      const accounts = await this.addApprovedAccounts()
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

  async signTransactionAndSend(_signedTransaction: string): Promise<number> {
    const transaction = base64StringToTransaction(_signedTransaction)

    if (!(await this.approveJsonRpcMethodRequest(transaction)))
      throw new Error('not implemented')

    const wallet = this.hederaWallet!
    const signedTransaction = await wallet.signTransaction(transaction)
    const response = await wallet.call(signedTransaction)
    // buildAndSendFormattedResponse
    console.log(response.toJSON())
    return 1
  }

  async signTransactionBody(signedTransaction: string): Promise<string> {
    throw new Error('not implemented')
  }
}
