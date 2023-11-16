import { Core } from '@walletconnect/core'
import {
  Web3Wallet as WalletConnectWallet,
  type Web3WalletTypes,
} from '@walletconnect/web3wallet'

import {
  Wallet as HederaWallet,
  Client,
  Transaction,
  // Query,
} from '@hashgraph/sdk'

import { HederaChainId } from '../shared'
import BaseWallet from './base'
import Provider from './provider'

export default class Wallet extends BaseWallet {
  public supportedHederaNetworks: HederaChainId[] = Object.values(this.supportedHederaNetworks)
  public accounts: string[] = []

  async init(projectId: string, metadata: Web3WalletTypes.Metadata) {
    // WalletConnect
    this.walletConnectWallet = await WalletConnectWallet.init({
      core: new Core({ projectId }),
      metadata,
    })

    // set up event listeners
    this.walletConnectWallet.on('session_proposal', this.handleSessionProposal)
    this.walletConnectWallet.on('session_update', this.handleSessionUpdate)
    // Session was deleted -> reset the dapp state, clean up from user session, etc.
    this.walletConnectWallet.on('session_delete', this.handleSessionDelete)
  }

  async addApprovedAccounts(): Promise<string[]> {
    // init Hedera Wallet
    const { accountId, privateKey } = {
      accountId: '123',
      privateKey: '123',
      // network: 'forTestnet',
    }
    // const client = Client[network]()
    const client = Client.forTestnet()
    const provider = new Provider(client)
    this.hederaWallet = new HederaWallet(accountId, privateKey, provider)
    return new Promise((resolve, reject) => {
      resolve(['hedera:testnet:0.0.123'])
    })
  }

  async approveJsonRpcMethodRequest(transaction: Transaction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(true)
    })
  }
}
