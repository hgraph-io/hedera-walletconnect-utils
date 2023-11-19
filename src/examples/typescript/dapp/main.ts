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
import { saveState, loadState } from '../shared'

// referenced in handlers
var signClient: SignClient | undefined
loadState() // load previous state if it exists

async function init(e: Event) {
  e.preventDefault()
  const form = new FormData(e.target as HTMLFormElement)
  const projectId = form.get('project-id') as string
  const metadata = JSON.parse(form.get('metadata') as string) as SignClientTypes.Metadata
  signClient = await SignClient.init({ projectId, metadata })

  signClient.on('session_event', (event) => {
    alert('There has been a session event!')
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
    projectId,
    chains,
  })

  walletConnectModal.openModal({ uri })
  await approval()
  walletConnectModal.closeModal()
}

document.getElementById('init').onsubmit = init

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
