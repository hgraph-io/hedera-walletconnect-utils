import { Core } from '@walletconnect/core'
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { Wallet } from '@hashgraph/sdk'
import { HederaJsonRpcMethods, methods, HederaChainId, events } from '../shared'
import type HederaWalletConnectWallet from './wallet'

enum test {
  best = 'asdf',
}

export class HederaWallet implements HederaWalletConnectWallet {
  // static properties
  static walletConnectCore = new Core({
    projectId: process.env.PROJECT_ID,
  })
  //
  public web3wallet: any
  public session: any

  /*
   * Step 1: Initialize the HederaWallet with the appropriate metadata
   */
  async init(metadata: any) {
    // init web3wallet

    this.web3wallet = await Web3Wallet.init({
      core: HederaWallet.walletConnectCore, // <- pass the shared `core` instance
      metadata: {
        name: 'Demo app',
        description: 'Demo Client as Wallet/Peer',
        url: 'www.walletconnect.com',
        icons: [],
      },
    })
    // set up event listeners
    this.web3wallet.on('session_proposal', this.handleSessionProposal)
  }

  /*
   * Step 2: user the pairing string from the dApp to pair the wallet
   */
  async pair(args: any) {
    return await this.web3wallet.pair(args)
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
            chains,
            methods: methods.map((method) => `hedera_${method}`),
            events,
            accounts,
          },
        },
      })
      // ------- end namespaces builder util ------------ //
      this.session = this.web3wallet.approveSession({
        id,
        namespaces: approvedNamespaces,
      })
    } catch (error) {
      // use the error.message to show toast/info-box letting the user know that the connection attempt was unsuccessful
      this.web3wallet.rejectSession({
        id,
        reason: getSdkError('USER_REJECTED'),
      })
    }
  }

  async approveAccounts(): Promise<string[]> {
    throw new Error('not implemented')
  }

  /*
   *  Session Requests
   */
  async handleSessionRequest(): Promise<any> {
    throw new Error('not implemented')
  }

  async [test.best](a: string): Promise<any> {}

  /*
   * Hedera JSON RPC Requests
   */
}
