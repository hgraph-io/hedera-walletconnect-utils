import { ICore } from '@walletconnect/types'
import { Web3Wallet as WalletConnectWallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { Wallet as HederaWallet } from '@hashgraph/sdk'
import { HederaChainId } from '../shared'
import type { HederaNativeWallet, HederaWalletConnectWallet } from './wallet'

/*
 * Mark as abstract to force the implementer to implement the abstract methods
 */
export default abstract class HederaNativeWalletConnectWallet
  implements HederaWalletConnectWallet, HederaNativeWallet
{
  abstract walletConnectCore: ICore
  abstract supportedHederaNetworks: HederaChainId[]
  // method to have wallet approve accounts
  abstract approveAccounts(): Promise<string[]>

  public walletConnectWallet?: unknown //TODO: fix unknowns
  public hederaWallets?: HederaWallet[] // do we need  to instantiate a HederaWallet for every account or do it on demand
  public session: unknown

  /*
   * Step 1: Initialize the HederaWallet with the appropriate metadata
   */
  async init(
    walletConnectMetadata: {},
    hederaWalletArgs: { accountId: string; privateKey: string },
  ) {
    // init WalletConnect
    this.walletConnectWallet = await WalletConnectWallet.init({
      core: this.walletConnectCore, // <- pass the shared `core` instance
      metadata: {
        name: 'Demo app',
        description: 'Demo Client as Wallet/Peer',
        url: 'www.walletconnect.com',
        icons: [],
      },
    })

    // set up event listeners
    this.walletConnectWallet.on('session_proposal', this.handleSessionProposal)

    // init Hedera Wallet
    this.hederaWallet = new HederaWallet(
      hederaWalletArgs.accountId,
      hederaWalletArgs.privateKey,
    )
  }

  /*
   * Step 2: user the pairing string from the dApp to pair the wallet
   */
  async pair(args: any) {
    return await this.walletConnectWallet.pair(args)
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
            methods: methods.map((method) => `hedera_${method}`),
            events,
            accounts,
          },
        },
      })
      // ------- end namespaces builder util ------------ //
      //TODO: can we have more than 1 session?
      this.session += this.walletConnectWallet.approveSession({
        id,
        namespaces: approvedNamespaces,
      })
    } catch (error) {
      // use the error.message to show toast/info-box letting the user know that the connection attempt was unsuccessful
      this.walletConnectWallet.rejectSession({
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

  async approveRequest(): Promise<any> {
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
    throw new Error('not implemented')
  }

  async signTransactionBody(signedTransaction: string): Promise<string> {
    throw new Error('not implemented')
  }
}
