import { Core } from '@walletconnect/core'
import {
  Web3Wallet as WalletConnectWallet,
  type Web3WalletTypes,
} from '@walletconnect/web3wallet'

import {
  Wallet as HederaWallet,
  Client,
  LocalProvider,
  Transaction,
  // Query,
} from '../../../../node_modules/@hashgraph/sdk/src/browser.js'

import { HederaChainId } from '../shared'
import BaseWallet from './base'

export default class Wallet extends BaseWallet {
  public supportedHederaNetworks: HederaChainId[] = Object.values(HederaChainId)

  async init(projectId: string, metadata: Web3WalletTypes.Metadata) {
    // WalletConnect
    this.walletConnectWallet = await WalletConnectWallet.init({
      core: new Core({ projectId }),
      metadata,
    })

    // set up event listeners
    this.walletConnectWallet.on('session_proposal', this.handleSessionProposal)
    this.walletConnectWallet.on('session_request', this.handleSessionRequest)
  }

  async addApprovedAccount(accountId: string, privateKey: string, chainId: HederaChainId): Promise<string> {
    const client = Client.forTestnet();
    // const provider = new Provider({ client });
    const account = `${chainId}:${accountId}`;

    this.hederaWallet = new HederaWallet(accountId, privateKey);
    this.accounts.push(account);

    return account;
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
    const provider = new LocalProvider({ client })
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
