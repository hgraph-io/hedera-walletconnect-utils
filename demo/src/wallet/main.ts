import { type Web3WalletTypes } from '@walletconnect/web3wallet'
import { getSdkError } from '@walletconnect/utils'
import { AccountId } from '@hashgraph/sdk'
import { Wallet, HederaChainId, base64StringToTransaction } from '@hashgraph/walletconnect'

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
      wallet.buildAndApproveSession(accounts, proposal)
    else
      await wallet.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED_METHODS'),
      })
  })

  wallet.on('session_request', async (event: Web3WalletTypes.SessionRequest) => {
    const method = event.params.request.method
    // Could be signed or unsigned transaction
    const body = base64StringToTransaction(event.params.request.params[0])
    const account = event.params.request.params[1] //|| wallet.getAccounts()[0]
    const privateKey = localStorage.getItem('private-key')
    // Client logic: prompt user for approval of transaction
    alert('Do you want to proceed with this transaction?')

    const response = await wallet[method](body, account, privateKey)

    // const privateKey = 'xyz'
    // let args = []

    // switch (method) {
    //   case HederaJsonRpcMethod.GetNodeAddresses:
    //     break
    //   case HederaJsonRpcMethod.SendTransactionOnly:
    //     break
    //   case HederaJsonRpcMethod.SignMessage:
    //     break
    //   case HederaJsonRpcMethod.SignQueryAndSend:
    //     break
    //   case HederaJsonRpcMethod.SignTransactionAndSend:
    //     break
    //   case HederaJsonRpcMethod.SignTransactionBody:
    //     break
    // }
    // account and private key are optional - i.e. for sendTransactionOnly or getNodeAddresses

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
