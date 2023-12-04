// https://docs.walletconnect.com/2.0/api/sign/dapp-usage
import SignClient from '@walletconnect/sign-client'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'
import { WalletConnectModal } from '@walletconnect/modal'
import { getSdkError } from '@walletconnect/utils'
import {
  TransferTransaction,
  Hbar,
  TransactionId,
  AccountInfoQuery,
  AccountId,
  Timestamp,
} from '@hashgraph/sdk'
import {
  HederaChainId,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  transactionToBase64String,
  queryToBase64String,
} from '@hashgraph/walletconnect'

import type {
  GetNodeAddressesRequest, // 1
  GetNodeAddressesResult, // 1
  SendTransactionOnlyRequest, // 2
  SendTransactionOnlyResult, // 2
  SignMessageRequest, // 3
  SignMessageResult, // 3
  SignQueryAndSendRequest, // 4
  SignQueryAndSendResult, // 4
  SignTransactionAndSendRequest, // 5
  SignTransactionAndSendResult, // 5
  SignTransactionBodyRequest, // 6
  SignTransactionBodyResult, // 6
} from '@hashgraph/walletconnect'

import { saveState, loadState, getState } from '../shared'

/*
 * Simple handler to show errors or success to user
 */
async function showErrorOrSuccess(method: (e: SubmitEvent) => Promise<any>, e: SubmitEvent) {
  try {
    e.preventDefault()
    saveState(e)
    const result = await method(e)
    console.log(result)
    alert(`Success: ${JSON.stringify(result)}`)
  } catch (e) {
    console.error(e)
    alert(`Error: ${JSON.stringify(e)}`)
  }
}
/*
 * WalletConnect
 *  - signClient
 *  - activeSession
 *  - init
 *  - connect
 *  - disconnect
 */
var signClient: SignClient | undefined
var activeSession: SessionTypes.Struct | undefined
loadState() // load previous state if it exists

// Initialize WalletConnect library
async function init(e: Event) {
  const projectId = getState('project-id')
  const metadata: SignClientTypes.Metadata = {
    name: getState('name'),
    description: getState('description'),
    url: getState('url'),
    icons: [getState('icons')],
  }

  // set global signClient to be referenced elsewhere
  signClient = await SignClient.init({ projectId, metadata })

  // Event handlers
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

  // set global activeSession
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

  console.log('dApp: WalletConnect initialized!')
  return 'dApp: WalletConnect initialized!'
}

document.getElementById('init').onsubmit = (e: SubmitEvent) => showErrorOrSuccess(init, e)

// connect a new pairing string to a wallet via the WalletConnect modal
async function connect(_: Event) {
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
    projectId: getState('project-id'),
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
document.getElementById('connect').onsubmit = (e: SubmitEvent) => showErrorOrSuccess(connect, e)

// disconnect
async function disconnect(_: Event) {
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
document.querySelector<HTMLFormElement>('#disconnect').onsubmit = (e: SubmitEvent) =>
  showErrorOrSuccess(disconnect, e)

/*
 * JSON RPC Methods
 */
// 1. hedera_getNodeAddresses
async function hedera_getNodeAddresses(_: Event) {
  const body: GetNodeAddressesRequest = {
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.GetNodeAddresses,
      params: undefined,
    },
  }

  return await signClient.request<GetNodeAddressesResult>(body)
}

document.getElementById('hedera_getNodeAddresses').onsubmit = (e: SubmitEvent) =>
  showErrorOrSuccess(hedera_getNodeAddresses, e)

// 2. hedera_sendTransactionOnly
async function hedera_sendTransactionOnly(e: Event) {
  const request: SendTransactionOnlyRequest = {
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SendTransactionOnly,
      params: {
        signedTransaction: getState('send-transaction'),
      },
    },
  }

  const result = await signClient.request<SendTransactionOnlyResult>(request)
  return result

  //   const { precheckCode, ...json } = response

  //   if (precheckCode !== 0) throw new Error(`PrecheckStatusError: ${precheckCode}:FAIL!`)

  //   const transactionResponse = TransactionResponse.fromJSON(json)
  //   const client = Client.forName('testnet')
  //   const receipt = await transactionResponse.getReceipt(client)
  //   alert(`${transactionResponse.transactionId}:${receipt.status.toString()}!`)
}

document.getElementById('hedera_sendTransactionOnly').onsubmit = (e: SubmitEvent) =>
  showErrorOrSuccess(hedera_sendTransactionOnly, e)

// 3. hedera_signMessage
async function hedera_signMessage(_: Event) {
  const body: SignMessageRequest = {
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SignMessage,
      params: {
        message: getState('sign-message'),
        signerAccountId: getState('sign-from'),
      },
    },
  }

  return await signClient.request<SignMessageResult>(body)
}

document.getElementById('hedera_signMessage').onsubmit = (e: SubmitEvent) =>
  showErrorOrSuccess(hedera_signMessage, e)

// 4. SignQueryAndSend
async function hedera_signQueryAndSend(_: Event) {
  const query = new AccountInfoQuery().setAccountId(getState('query-payment-account'))
  const body: SignQueryAndSendRequest = {
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SignQueryAndSend,
      params: {
        signerAccountId: getState('query-payment-account'),
        query: queryToBase64String(query),
      },
    },
  }

  return await signClient.request<SignQueryAndSendResult>(body)
}

document.getElementById('hedera_signQueryAndSend').onsubmit = (e: SubmitEvent) =>
  showErrorOrSuccess(hedera_signQueryAndSend, e)

// 5. hedera_signTransactionAndSend
async function hedera_signTransactionAndSend(_: Event) {
  const transaction = new TransferTransaction()
    .setTransactionId(TransactionId.generate(getState('sign-send-from')))
    .addHbarTransfer(getState('sign-send-from'), new Hbar(-getState('sign-send-amount')))
    .addHbarTransfer(getState('sign-send-to'), new Hbar(+getState('sign-send-amount')))

  const body: SignTransactionAndSendRequest = {
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SignTransactionAndSend,
      params: {
        signedTransaction: transactionToBase64String(transaction),
        signerAccountId: getState['sign-send-from'],
      },
    },
  }

  return await signClient.request<SignTransactionAndSendResult>(body)

  // if (response.precheckCode !== 0) {
  //   alert(`${transactionResponse.transactionId}:${response.precheckCode}:FAIL!`)
  // const transactionResponse = TransactionResponse.fromJSON(response)
  // }
  // const client = Client.forName('testnet')
  // const receipt = await transactionResponse.getReceipt(client)
  // alert(`${transactionResponse.transactionId}:${receipt.status.toString()}!`)
}
document.getElementById('hedera_signTransactionAndSend').onsubmit = (e: SubmitEvent) =>
  showErrorOrSuccess(hedera_signTransactionAndSend, e)

// 6. hedera_signTransactionBody
async function hedera_signTransactionBody(_: Event) {
  const transaction = new TransferTransaction()
    .setTransactionId(TransactionId.generate(getState('sign-from')))
    .addHbarTransfer(getState('sign-from'), new Hbar(-getState('sign-amount')))
    .addHbarTransfer(getState('sign-to'), new Hbar(+getState('sign-amount')))

  const body: SignTransactionBodyRequest = {
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SignTransactionBody,
      params: {
        signerAccountId: getState('sign-from'),
        transactionBody: transactionToBase64String(transaction),
      },
    },
  }

  return await signClient.request<SignTransactionBodyResult>(body)

  // console.log(response)
  // console.log(base64StringToSignatureMap(response.signatureMap))
  // alert(`Transaction body signed: ${response}!`)
}
document.getElementById('hedera_signTransactionBody').onsubmit = (e: SubmitEvent) =>
  showErrorOrSuccess(hedera_signTransactionBody, e)

/*
 * Error handling simulation
 */
async function simulateGossipNodeError(_: Event) {
  const sender = getState('sign-send-from') || getState('send-from')
  const recepient = getState('sign-send-to') || getState('send-to')

  const transaction = new TransferTransaction()
    .setNodeAccountIds([new AccountId(999)]) // this is invalid node id
    .setTransactionId(TransactionId.generate(sender))
    .addHbarTransfer(sender, new Hbar(-5))
    .addHbarTransfer(recepient, new Hbar(+5))

  const body: SignTransactionAndSendRequest = {
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SignTransactionAndSend,
      params: {
        signedTransaction: transactionToBase64String(transaction),
        signerAccountId: getState('sign-send-from'),
      },
    },
  }
  return await signClient.request<SignTransactionAndSendResult>(body)
}

document.getElementById('error-gossip-node').onsubmit = (e: SubmitEvent) =>
  showErrorOrSuccess(simulateGossipNodeError, e)

async function simulateTransactionExpiredError(_: Event) {
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

  const body: SignTransactionAndSendRequest = {
    topic: activeSession.topic,
    chainId: HederaChainId.Testnet,
    request: {
      method: HederaJsonRpcMethod.SignTransactionAndSend,
      params: {
        signedTransaction: transactionToBase64String(transaction),
        signerAccountId: sender,
      },
    },
  }
  return await signClient.request<SignTransactionAndSendResult>(body)
}

document.getElementById('error-transaction-expired').onsubmit = (e: SubmitEvent) =>
  showErrorOrSuccess(simulateTransactionExpiredError, e)
