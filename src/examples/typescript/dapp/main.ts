// https://docs.walletconnect.com/2.0/api/sign/dapp-usage
import SignClient from '@walletconnect/sign-client'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'
import { WalletConnectModal } from '@walletconnect/modal'
import { getSdkError } from '@walletconnect/utils'
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
  base64StringToTransaction,
} from '@hashgraph/walletconnect'
import { saveState, loadState } from '../shared'

// referenced in handlers
var signClient: SignClient | undefined
var activeSession: SessionTypes.Struct | undefined
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
    alert('Dapp: Session deleted by wallet!')
    //
  })
  signClient.core.pairing.events.on('pairing_delete', (pairing) => {
    // Session was deleted
    console.log(pairing)
    alert(`Dapp: Pairing deleted by wallet!`)
    // clean up after the pairing for `topic` was deleted.
  })

  activeSession = signClient.session
    .getAll()
    .reverse()
    .find((session: { expiry: number }) => session.expiry > Date.now() / 1000)

  //@ts-ignore
  e.target.querySelectorAll('input,button').forEach((input) => (input.disabled = true))
  document
    .querySelectorAll('.toggle input,.toggle button, .toggle select')
    //@ts-ignore
    .forEach((element) => (element.disabled = false))
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

  activeSession = signClient.session
    .getAll()
    .reverse()
    .find((session: { expiry: number }) => session.expiry > Date.now() / 1000)
}
document.getElementById('connect').onsubmit = connect

/*
 * JSON RPC Methods
 */
async function hedera_signTransactionBody(e: Event) {
  const state = saveState(e)
  console.log(state)
  console.log(activeSession)
  console.log(signClient)
  // Sample transaction
  const transaction = new TransferTransaction()
    .setTransactionId(TransactionId.generate(state['sign-from']))
    .addHbarTransfer(state['sign-from'], new Hbar(-state['sign-amount']))
    .addHbarTransfer(state['sign-to'], new Hbar(+state['sign-amount']))

  const response: string = await signClient.request({
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SignTransactionBody,
      params: [transactionToBase64String(transaction)],
    },
  })

  console.log(response)
  console.log(base64StringToTransaction(response))
  alert(`Transaction body signed: ${response}!`)
}
document.getElementById('hedera_signTransactionBody').onsubmit = hedera_signTransactionBody

//
async function hedera_sendTransactionOnly(e: Event) {
  const state = saveState(e)

  const response: TransactionResponseJSON = await signClient.request({
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SendTransactionOnly,
      params: [state['send-transaction']],
    },
  })
  const transactionResponse = TransactionResponse.fromJSON(response)
  const client = Client.forName('testnet')
  const receipt = await transactionResponse.getReceipt(client)
  alert(`${transactionResponse.transactionId}:${receipt.status.toString()}!`)
}
document.getElementById('hedera_sendTransactionOnly').onsubmit = hedera_sendTransactionOnly

//
async function hedera_signTransactionAndSend(e: Event) {
  const state = saveState(e)
  // Sample transaction
  const transaction = new TransferTransaction()
    .setTransactionId(TransactionId.generate(state['sign-send-from']))
    .addHbarTransfer(state['sign-send-from'], new Hbar(-state['sign-send-amount']))
    .addHbarTransfer(state['sign-send-to'], new Hbar(+state['sign-send-amount']))

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
}
document.getElementById('hedera_signTransactionAndSend').onsubmit =
  hedera_signTransactionAndSend

async function disconnect(e: Event) {
  e.preventDefault()
  for (const session of signClient.session.getAll()) {
    console.log(`Disconnecting from session: ${session}`)
    await signClient.disconnect({
      topic: session.topic,
      reason: getSdkError('USER_DISCONNECTED'),
    })
  }
  //https://docs.walletconnect.com/api/core/pairing
  for (const pairing of signClient.core.pairing.getPairings()) {
    console.log(`Disconnecting from pairing: ${pairing}`)
    await signClient.disconnect({
      topic: pairing.topic,
      reason: getSdkError('USER_DISCONNECTED'),
    })
  }
}
document.querySelector<HTMLFormElement>('#disconnect').onsubmit = disconnect
