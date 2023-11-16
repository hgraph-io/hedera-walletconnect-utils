import { Buffer } from 'buffer'
import { type Web3WalletTypes } from '@walletconnect/web3wallet'
import { SessionTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'

import { Client, Transaction, AccountId, PrivateKey } from '@hashgraph/sdk'
import { Wallet, type HederaChainId, base64StringToTransaction } from '@hashgraph/walletconnect'

/*
 * Reference to wallet for use in the demo
 */
let wallet: Wallet

/*
 * Required params for the demo
 */
const params = [
  'account-id', // Hedera
  'private-key', // Hedera
  'project-id', // WallectConnect
  'metadata', // WallectConnect
]

// load saved params
for (const key in params)
  document.querySelector<HTMLInputElement>(key).value = localStorage.getItem(key) || ''

/*
 * Handle pairing event on initialized wallet
 */
document.querySelector<HTMLFormElement>('#pair').onSubmit = async function pair(event: Event) {
  event.preventDefault()
  const data = new FormData(event.target as HTMLFormElement)
  const uri = data.get('uri') as string
  localStorage.setItem('uri', uri)
  await wallet.core.pairing.pair({ uri })
}

/*
 * Initialize wallet
 */
document.querySelector<HTMLFormElement>('#init').onSubmit = async function onSubmit(
  event: Event,
) {
  event.preventDefault()

  const projectId = document.querySelector('project-id')
  const metadata = JSON.parse(localStorage.getItem('walletconnect-metadata'))

  wallet = await Wallet.init({ projectId, metadata })

  /*
   * Add listeners
   */
  wallet.on('session_proposal', async (proposal: Web3WalletTypes.SessionProposal) => {
    // Client logic: prompt for approval of accounts
    const network = AccountId.fromString(localStorage.getItem('hedera-network'))
    const accountId = AccountId.fromString(localStorage.getItem('account-id'))
    const accounts: HederaChainId[] = [`hedera:${network}:${accountId}`]

    if (confirm(`Do you want to connect to this session?: ${JSON.stringify(proposal)}`))
      await wallet.buildAndApproveSession(accounts, proposal)
    else
      await wallet.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED_METHODS'),
      })
  })

  wallet.on('session_request', async (event: Web3WalletTypes.SessionRequest) => {
    // TODO: here
    const method = event.params.request.method
    // Could be signed or unsigned transaction
    const signedTransaction = base64StringToTransaction(event.params.request.params[0])
    const account = event.params.request.params[1] //|| wallet.getAccounts()[0]
    // Client logic: prompt user for approval of transaction
    alert('Do you want to proceed with this transaction?')

    const privateKey = 'xyz'
    const response = await wallet[method]({ signedTransaction }, { account, privateKey })
    // Set the operator with the account ID and private key (operator)
    // The operator is the account that will, by default, pay the transaction fee for transactions and queries built with this client.
    // client.setOperator(accountId, PrivateKey.fromString(sessionStorage.getItem('privateKey')))

    // // const freezeTransaction = transaction.freezeWith(client)
    // const signedTransaction = await transaction.signWithOperator(client)
    // // const signed = await freezeTransaction.sign(PrivateKey.fromString(sessionStorage.getItem('privateKey')))
    // const transactionResponse = await signedTransaction.execute(client)

    // const transactionId = transactionResponse.transactionId

    // const transactionReceipt = await transactionResponse.getReceipt(client)
    // console.log('Status:', transactionReceipt.status)
    // console.log(topic)

    // await wallet.respondSessionRequest({
    // id: event.id,
    //   response: { result: true, id, jsonrpc: '2.0' },
    // })
    // // alert(`${transactionId} - has been submitted to the network.`)
  })
}

/*
 * Handle changes in wallet
 */
// await web3wallet.updateSession({ topic, namespaces: newNs });
// await web3wallet.disconnectSession({
// topic,
// reason: getSdkError("USER_DISCONNECTED"),
// });
