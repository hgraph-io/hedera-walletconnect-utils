// https://docs.walletconnect.com/2.0/api/sign/dapp-usage
import { SignClientTypes } from '@walletconnect/types'
import {
  TransactionResponseJSON,
  TransactionResponse,
  TransferTransaction,
  Hbar,
  TransactionId,
  Client,
  AccountInfoQuery,
  AccountId,
  Timestamp,
  LedgerId,
} from '@hashgraph/sdk'
import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  transactionToBase64String,
  queryToBase64String,
  base64StringToTransaction,
  DAppConnector,
} from '@hashgraph/walletconnect'

import { saveState, loadState, getState } from '../shared'

// referenced in handlers
var dAppConnector: DAppConnector | undefined
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

  dAppConnector = new DAppConnector(
    metadata,
    LedgerId.TESTNET,
    projectId,
    Object.values(HederaJsonRpcMethod),
    [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
  )

  await dAppConnector.init({ logger: 'error' })

  //@ts-ignore
  e.target.querySelectorAll('input,button').forEach((input) => (input.disabled = true))
  document
    .querySelectorAll('.toggle input,.toggle button, .toggle select')
    //@ts-ignore
    .forEach((element) => (element.disabled = false))

  console.log('dApp: WalletConnect initialized!')
}

document.getElementById('init').onsubmit = init

async function connect(e: Event) {
  try {
    saveState(e)

    await dAppConnector!.connectQR()
    console.log('Connected to wallet!')
    alert('Connected to wallet!')
  } catch (e) {
    console.log(e)
  }
}
document.getElementById('connect').onsubmit = connect

/*
 * JSON RPC Methods
 */
async function hedera_signTransactionBody(e: Event) {
  const state = saveState(e)
  // Sample transaction
  const transaction = new TransferTransaction()
    .setTransactionId(TransactionId.generate(state['sign-from']))
    .addHbarTransfer(state['sign-from'], new Hbar(-state['sign-amount']))
    .addHbarTransfer(state['sign-to'], new Hbar(+state['sign-amount']))

  const response = await dAppConnector!.signTransactionBody([
    transactionToBase64String(transaction),
  ])

  console.log(response)
  console.log(base64StringToTransaction(response))
  alert(`Transaction body signed: ${response}!`)
}
document.getElementById('hedera_signTransactionBody').onsubmit = hedera_signTransactionBody

//
async function hedera_sendTransactionOnly(e: Event) {
  const state = saveState(e)

  const response = await dAppConnector!.sendTransactionOnly([state['send-transaction']])
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

  const response: TransactionResponseJSON = await dAppConnector!.signTransactionAndSend([
    transactionToBase64String(transaction),
  ])

  const transactionResponse = TransactionResponse.fromJSON(response)
  const client = Client.forName('testnet')
  const receipt = await transactionResponse.getReceipt(client)
  alert(`${transactionResponse.transactionId}:${receipt.status.toString()}!`)
}
document.getElementById('hedera_signTransactionAndSend').onsubmit =
  hedera_signTransactionAndSend

async function disconnect(e: Event) {
  e.preventDefault()
  dAppConnector?.disconnectAll()
}
document.querySelector<HTMLFormElement>('#disconnect').onsubmit = disconnect

async function hedera_getNodeAddresses(e: Event) {
  e.preventDefault()

  const response = await dAppConnector!.getNodeAddresses()

  console.log(response)
}

document.getElementById('hedera_getNodeAddresses').onsubmit = hedera_getNodeAddresses

async function hedera_signMessage(e: Event) {
  const state = saveState(e)

  try {
    const response = await dAppConnector?.signMessage([state['sign-message']])
    console.log(response)
  } catch (e) {
    console.error(e)
    alert(JSON.stringify(e))
  }
}

document.getElementById('hedera_signMessage').onsubmit = hedera_signMessage

async function hedera_signQueryAndSend(e: Event) {
  const state = saveState(e)

  const query = new AccountInfoQuery().setAccountId(state['query-payment-account'])
  const response: string = await dAppConnector!.signQueryAndSend([queryToBase64String(query)])

  console.log(response)
  alert(`Query response received: ${JSON.stringify(response)}!`)
}

document.getElementById('hedera_signQueryAndSend').onsubmit = hedera_signQueryAndSend

/*
 * Error handling simulation
 */
async function simulateGossipNodeError(e: Event) {
  e.preventDefault()
  try {
    const sender = getState('sign-send-from') || getState('send-from')
    const recepient = getState('sign-send-to') || getState('send-to')

    const transaction = new TransferTransaction()
      .setNodeAccountIds([new AccountId(999)]) // this is invalid node id
      .setTransactionId(TransactionId.generate(sender))
      .addHbarTransfer(sender, new Hbar(-5))
      .addHbarTransfer(recepient, new Hbar(+5))

    const response = await dAppConnector!.signTransactionAndSend([
      transactionToBase64String(transaction),
    ])

    console.log(response)
  } catch (e) {
    console.error(e)
    alert(JSON.stringify(e))
  }
}

document.getElementById('error-gossip-node').onsubmit = simulateGossipNodeError

async function simulateTransactionExpiredError(e: Event) {
  e.preventDefault()
  try {
    const sender = getState('sign-send-from') || getState('send-from')
    const recepient = getState('sign-send-to') || getState('send-to')

    const transaction = new TransferTransaction()
      // set valid start to 15 seconds ago
      .setTransactionId(
        TransactionId.withValidStart(
          AccountId.fromString(sender),
          Timestamp.fromDate(Date.now() - 15000),
        ),
      )
      // 15 seconds is a minimum valid duration otherwise there's an INVALID_TRANSACTION_DURATION error
      .setTransactionValidDuration(15)
      .addHbarTransfer(sender, new Hbar(-5))
      .addHbarTransfer(recepient, new Hbar(+5))

    const response = await dAppConnector?.signTransactionAndSend([
      transactionToBase64String(transaction),
    ])
    console.log(response)
  } catch (e) {
    console.log(e)
    alert(JSON.stringify(e))
  }
}

document.getElementById('error-transaction-expired').onclick = simulateTransactionExpiredError
