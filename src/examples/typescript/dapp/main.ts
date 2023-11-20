// https://docs.walletconnect.com/2.0/api/sign/dapp-usage
import SignClient from '@walletconnect/sign-client'
import { SignClientTypes } from '@walletconnect/types'
import { WalletConnectModal } from '@walletconnect/modal'
import {
  TransactionResponseJSON,
  TransactionResponse,
  TransferTransaction,
  Hbar,
  TransactionId,
  Client,
} from '@hashgraph/sdk'
import {
  HederaChainId,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  transactionToBase64String,
} from '@hashgraph/walletconnect'
import { saveState, loadState } from '../shared'

// referenced in handlers
var signClient: SignClient | undefined
loadState() // load previous state if it exists

async function init(e: Event) {
  const state = saveState(e)

  const projectId = state['project-id']
  const metadata: SignClientTypes.Metadata = {
    name: state['name'],
    description: state['description'],
    url: state['url'],
    icons: [state['icons']],
  }
  signClient = await SignClient.init({ projectId, metadata })

  signClient.on('session_event', (event) => {
    // Handle session events, such as "chainChanged", "accountsChanged", etc.
    alert('There has been a session event!')
    console.log(event)
  })

  signClient.on('session_update', ({ topic, params }) => {
    // Handle session update
    alert('There has been a update to the session!')
    const { namespaces } = params
    const _session = signClient.session.get(topic)
    // Overwrite the `namespaces` of the existing session with the incoming one.
    const updatedSession = { ..._session, namespaces }
    // Integrate the updated session state into your dapp state.
    console.log(updatedSession)
  })

  signClient.on('session_delete', () => {
    // Session was deleted -> reset the dapp state, clean up from user session, etc.
    alert('Session deleted!')
		//
  })
}

document.getElementById('init').onsubmit = init

async function connect(e: Event) {
  const state = saveState(e)
  const chains = [HederaChainId.Testnet]
  const { uri, approval } = await signClient.connect({
    requiredNamespaces: {
      hedera: {
        methods: Object.values(HederaJsonRpcMethod),
        chains,
        events: [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
      },
    },
  })
  const walletConnectModal = new WalletConnectModal({
    projectId: state['project-id'],
    chains,
  })

  walletConnectModal.openModal({ uri })
  await approval()
  walletConnectModal.closeModal()
}
document.getElementById('connect').onsubmit = connect

async function hedera_signTransactionAndSend(e: Event) {
  const state = saveState(e)
  // Sample transaction
  const transaction = new TransferTransaction()
    .setTransactionId(TransactionId.generate(state['from']))
    .addHbarTransfer(state['from'], new Hbar(-state['amount']))
    .addHbarTransfer(state['to'], new Hbar(+state['amount']))

  const activeSession = signClient.session
    .getAll()
    .reverse()
    .find((session: { expiry: number }) => session.expiry > Date.now() / 1000)

  const response: TransactionResponseJSON = await signClient.request({
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SignTransactionAndSend,
      params: [transactionToBase64String(transaction)],
    },
  })
  const transactionResponse = TransactionResponse.fromJSON(response)
  const client = Client.forName('testnet')
  const receipt = await transactionResponse.getReceipt(client)
  alert(`${transactionResponse.transactionId}:${receipt.status.toString()}!`)
  //TODO: get record is a payed operation, we can use hedera_signQueryAndSend to get the query
  // const record = await transactionResponse.getRecord(client)
  // console.log(record)
}

document.getElementById('hedera_signTransactionAndSend').onsubmit =
  hedera_signTransactionAndSend
