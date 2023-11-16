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

export default abstract class HederaNativeWalletConnectWallet
  implements HederaWalletConnectWallet, HederaNativeWallet
{
  private constructor(
    public readonly projectId: string,
    public readonly metadata: Web3WalletTypes.Metadata,
    public chains: HederaChainId[] = [HederaChainId.Mainnet, HederaChainId.Testnet],
  ) {}

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

  // session proposal handler
  async approveSession(
    accounts: string[],
    { id, params }: Web3WalletTypes.SessionProposal,
  ) {
    const approvedNamespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: {
        hedera: {
          chains: this.chains,
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
    console.log(response)
    return 1
  }

  async signTransactionBody(signedTransaction: string): Promise<string> {
    throw new Error('not implemented')
  }
}
