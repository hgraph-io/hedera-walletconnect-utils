// https://docs.walletconnect.com/2.0/api/sign/dapp-usage
import SignClient from '@walletconnect/sign-client'
import { SignClientTypes } from '@walletconnect/types'
import { WalletConnectModal } from '@walletconnect/modal'
// import { TransferTransaction, Hbar } from '@hashgraph/sdk'
import {
  HederaChainId,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  // transactionToBase64String,
} from '@hashgraph/walletconnect'
import { saveState, getState, loadState } from '../shared'

// referenced in handlers
var signClient: SignClient | undefined
loadState() // load previous state if it exists

async function init(e: Event) {
  e.preventDefault()
  const form = new FormData(e.target as HTMLFormElement)
  saveState(form)

  const projectId = form.get('project-id') as string
  const metadata: SignClientTypes.Metadata = {
    name: form.get('name') as string,
    description: form.get('description') as string,
    url: form.get('url') as string,
    icons: [form.get('icons') as string],
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
  })
}

document.getElementById('init').onsubmit = init

async function connect(e: Event) {
  e.preventDefault()
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
}
document.getElementById('connect').onsubmit = connect

// // Sample transaction
// async function signExecuteTransaction() {
//   const transaction = new TransferTransaction()
//     .addHbarTransfer('123', new Hbar(-100))
//     .addHbarTransfer('1234', new Hbar(100))
//   // console.log(signClient)

//   // signClient.request({
//   //   topic: 'asdf',
//   //   chainId: HederaChainId.Testnet,
//   //   request: {
//   //     method: HederaJsonRpcMethod.SignTransactionAndSend,
//   //     params: [transactionToBase64String(transaction)],
//   //   },
//   // })
// }
