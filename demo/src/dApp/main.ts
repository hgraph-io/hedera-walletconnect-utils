import { Buffer } from 'buffer'
/*
 * https://docs.walletconnect.com/2.0/api/sign/dapp-usage
 */
import SignClient from '@walletconnect/sign-client'
import { WalletConnectModal } from '@walletconnect/modal'
import {
  AccountId,
  TransactionId,
  TransferTransaction,
  Hbar,
  Client,
  // RequestType,
} from '@hashgraph/sdk'

/*
 * Required params for the demo
 */
const params = {
  projectId: 'your dApp’s project id from https://cloud.walletconnect.com',
}

/*
 * window.onload
 * See if all required params are already in the session
 */
window.onload = function onload() {
  for (const [key, _] of Object.entries(params))
    if (!sessionStorage.getItem(key)) {
      sessionStorage.clear()
      throw new Error('dApp environment not initialized')
    }

  // if all env variables are initialized, show the pair button
  document.querySelectorAll('.toggle').forEach((el) => {
    el.classList.toggle('hidden')
  })
}

/*
 * Prompt user for required params
 */
window.initializeSession = async function initialize() {
  for (const [key, message] of Object.entries(params)) {
    const value = prompt(`Please enter ${message}`) || undefined
    if (value) sessionStorage.setItem(key, value)
    else throw new Error(`No ${key} provided`)
  }

  document.querySelectorAll('.toggle').forEach((el) => {
    el.classList.toggle('hidden')
  })
}

/*
 * Initiate WalletConnect Sign Client
 */
async function initializeWalletConnect() {
  const projectId = sessionStorage.getItem('projectId')

  const signClient = await SignClient.init({
    projectId,
    metadata: {
      name: 'dApp',
      description: 'This is a dApp',
      url: 'https://hgraph.app',
      icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
  })

  /*
   * Add listeners
   */

  signClient.on('session_event', (event) => {
    console.log('session_event')
    console.log(event)
    // Handle session events, such as "chainChanged", "accountsChanged", etc.
  })

  signClient.on('session_update', ({ topic, params }) => {
    console.log('session_update')
    const { namespaces } = params
    const _session = signClient.session.get(topic)
    // Overwrite the `namespaces` of the existing session with the incoming one.
    const updatedSession = { ..._session, namespaces }
    // Integrate the updated session state into your dapp state.
    // console.log(updatedSession)
  })

  signClient.on('session_delete', () => {
    console.log('session deleted')
    // Session was deleted -> reset the dapp state, clean up from user session, etc.
  })

  return signClient
}

/*
 * Connect the application and specify session permissions.
 */
document.getElementById('open-modal').onclick = async function openModal() {
  const projectId = sessionStorage.getItem('projectId')
  window.signClient = await initializeWalletConnect()
  // Create WalletConnectModal instance
  const walletConnectModal = new WalletConnectModal({
    projectId,
    chains: ['hedera:testnet'],
  })
  const { uri, approval } = await window.signClient.connect({
    requiredNamespaces: {
      hedera: {
        methods: [
          'hedera_xxx',
          'hedera_signAndExecuteTransaction',
          'hedera_signAndReturnTransaction',
          'hedera_signMessage',
        ],
        chains: ['hedera:testnet'],
        events: ['chainChanged', 'accountsChanged'],
      },
    },
  })

  // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
  if (uri) {
    walletConnectModal.openModal({ uri })
  }
  console.log(uri)
  // Await session approval from the wallet.
  const session = await approval()
  console.log(session)
  window.session = session
  alert('Connected!')
  walletConnectModal.closeModal()
  // Handle the returned session (e.g. update UI to "connected" state).
  sessionStorage.setItem('wallet-connect-session', JSON.stringify(session))
  // Close the QRCode modal in case it was open.
}
/*
 * Sample transaction
 */
document.getElementById('sign-execute-transaction').onclick =
  async function signExecuteTransaction() {
    console.log('whyyyyyyyyyyy')
    const sendHbarTo = prompt('Where would you like to send 100 hbar to?', '0.0.450178')
    const walletConnectSession = JSON.parse(sessionStorage.getItem('wallet-connect-session'))

    const payerAccountId = AccountId.fromString(
      walletConnectSession.namespaces.hedera.accounts[0].split(':')[2],
    )
    const client = Client.forTestnet()
    console.log(client)

    // Create a transaction to transfer 100 hbars
    const transaction = new TransferTransaction()
      .setNodeAccountIds([new AccountId(3)])
      .setTransactionId(TransactionId.generate(payerAccountId))
      .addHbarTransfer(payerAccountId, new Hbar(-100))
      .addHbarTransfer(sendHbarTo, new Hbar(100))
      .freeze()
      .toBytes()

    console.log('transaction', transaction)
    console.log(window.session)

    const params = [Buffer.from(transaction).toString('base64')]
    console.log(params)

    window.signClient.request({
      topic: window.session.topic,
      chainId: 'hedera:testnet',
      request: {
        method: 'hedera_xxx',
        params,
      },
    })
  }
