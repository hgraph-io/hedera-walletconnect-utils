import { Buffer } from 'buffer'
import { type Web3WalletTypes } from '@walletconnect/web3wallet'
import SignClient from '@walletconnect/sign-client'
import { Client, Transaction, AccountId, PrivateKey } from '@hashgraph/sdk'

import { Wallet, type HederaChainId, base64StringToTransaction } from '@hashgraph/walletconnect'

/*
 * Required params for the demo
 */
const params = [
  'account-id',
  'hedera-private-key',
  'walletconnect-project-id',
  'walletconnect-metadata',
]

/*
 * See if all required params are already in the session
 */
for (const key in params)
  document.querySelector<HTMLInputElement>(key).value = localStorage.getItem(key) || ''

document.querySelector<HTMLFormElement>('#init').onSubmit = async function onSubmit(
  event: Event,
) {
  event.preventDefault()

  const projectId = document.querySelector('project-id')
  const metadata = JSON.parse(localStorage.getItem('walletconnect-metadata'))

  const wallet = await Wallet.init({ projectId, metadata })

  /*
   * Add listeners
   */

  wallet.on('session_proposal', async (params: Web3WalletTypes.SessionProposal) => {
    // see which accounts to add
    const network = AccountId.fromString(localStorage.getItem('hedera-network'))
    const accountId = AccountId.fromString(localStorage.getItem('account-id'))
    const accounts: HederaChainId[] = [`hedera:${network}:${accountId}`]
    await wallet.approveSession(accounts, params)
  })

  signClient.on('session_update', ({ topic, params }) => {
    console.log('session_update')
    const { namespaces } = params
    const _session = signClient.session.get(topic)
    // Overwrite the `namespaces` of the existing session with the incoming one.
    const updatedSession = { ..._session, namespaces }
    // Integrate the updated session state into your dapp state.
    console.log(updatedSession)
  })

  signClient.on('session_request', async (event) => {
    console.log('session_request')
    console.log(event)
    const { topic, params, id } = event
    const { request } = params

    // convert `requestParamsMessage` by using a method like hexToUtf8
    const decoded = Buffer.from(request.params[0], 'base64')
    const transaction = Transaction.fromBytes(decoded)
    const client = Client.forTestnet()

    // Set the operator with the account ID and private key (operator)
    // The operator is the account that will, by default, pay the transaction fee for transactions and queries built with this client.
    client.setOperator(accountId, PrivateKey.fromString(sessionStorage.getItem('privateKey')))

    // const freezeTransaction = transaction.freezeWith(client)
    const signedTransaction = await transaction.signWithOperator(client)
    // const signed = await freezeTransaction.sign(PrivateKey.fromString(sessionStorage.getItem('privateKey')))
    const transactionResponse = await signedTransaction.execute(client)

    const transactionId = transactionResponse.transactionId

    const transactionReceipt = await transactionResponse.getReceipt(client)
    console.log('Status:', transactionReceipt.status)
    console.log(topic)

    await signClient.respond({ topic, response: { result: true, id, jsonrpc: '2.0' } })
    alert(`${transactionId} - has been submitted to the network.`)
  })
}

/*
 * Create a session on user action
 */
window.pair = async function pair() {
  const signClient = await initializeWalletConnect()
  const uri = (document.querySelector('input[name="uri"]') as HTMLInputElement)?.value
  if (!uri) throw new Error('No URI')

  await signClient.core.pairing.pair({ uri })
}
