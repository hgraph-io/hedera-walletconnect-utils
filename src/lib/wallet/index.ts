import { Core } from '@walletconnect/core'
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { Wallet as HederaWallet, Client, Transaction } from '@hashgraph/sdk'
import {
  HederaChainId,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  HEDERA_JSON_RPC_PREFIX,
  base64StringToTransaction,
} from '../shared'
import Provider from './provider'

import type { HederaNativeWallet, HederaWalletConnectWallet } from './wallet'

// https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/web3wallet/src/client.ts
export default class HederaNativeWalletConnectWallet extends Web3Wallet {
  // implements HederaNativeWallet
  constructor(
    public readonly projectId: string,
    public readonly metadata: Web3WalletTypes.Metadata,
    public chains: HederaChainId[] = [HederaChainId.Mainnet, HederaChainId.Testnet],
  ) {
    super({
      core: new Core({ projectId }),
      metadata,
    })
  }

  // session proposal handler
  public buildAndApproveSession(
    accounts: string[],
    { id, params }: Web3WalletTypes.SessionProposal,
  ) {
    this.approveSession({
      id,
      namespaces: buildApprovedNamespaces({
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
      }),
    })
  }

  /*
   * Hedera Wallet Signer
   */
  //hedera:mainnet:0.0.123456
  public getSigner(account: string, privateKey: string, _provider?: Provider): HederaWallet {
    const split = account.split(':')
    const network = split[1]
    const accountId = split[2]
    const client = Client.forName(network)
    const provider = _provider ?? new Provider(client)
    return new HederaWallet(accountId, privateKey, provider)
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

  public async hedera_signTransactionAndSend(
    body: { signedTransaction: Transaction }, // can be signedTransaction or not signedTransaction
    opts: {
      account: string
      privateKey: string
    },
  ): Promise<{ precheckcode: number }> {
    const signer = this.getSigner(opts.account, opts.privateKey)
    const response = await signer.call(await signer.signTransaction(body.signedTransaction))
    // buildAndSendFormattedResponse
    console.log(response)
    return { precheckcode: 1 }
  }

  async signTransactionBody(signedTransaction: string): Promise<string> {
    throw new Error('not implemented')
  }
}
