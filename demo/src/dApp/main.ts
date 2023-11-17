import { Buffer } from 'buffer';

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
  // RequestType,
} from '@hashgraph/sdk'

/*
 * Required params for the demo
 */
const params = {
  projectId: 'your dApp’s project id from https://cloud.walletconnect.com',
}

/*
 * SignClient - @walletconnect api for encrypted connection between dApp and wallet
 */
let signClient: SignClient;

/*
 * window.onload
 * See if all required params are already in the session
 */
window.onload = function onload() {
  for (let key in params) {
    if (!sessionStorage.getItem(key)) {
      sessionStorage.clear()
      throw new Error('dApp environment not initialized')
    }
  }

  // if all env variables are initialized, show the pair button
  document.querySelectorAll('.toggle').forEach((el) => {
    el.classList.toggle('hidden')
  })
}

/*
 * Prompt user for required params
 */
// @ts-ignore
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
  const projectId = sessionStorage.getItem('projectId')!;

  const InitializedSignClient = await SignClient.init({
    projectId,
    metadata: {
      name: 'Example dApp',
      description: 'This is an Example dApp',
      url: 'https://hgraph.app',
      icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
  })

  /*
   * Add listeners
   */

  InitializedSignClient.on('session_event', (event) => {
    console.log('session_event')
    // Handle session events, such as "chainChanged", "accountsChanged", etc.
  })

  InitializedSignClient.on('session_update', ({ topic, params }) => {
    console.log('session_update')
    // const { namespaces } = params
    // const _session = signClient.session.get(topic)
    // Overwrite the `namespaces` of the existing session with the incoming one.
    // const updatedSession = { ..._session, namespaces }
    // Integrate the updated session state into your dapp state.
    // console.log(updatedSession)
  })

  InitializedSignClient.on('session_delete', () => {
    console.log('session deleted')
    // Session was deleted -> reset the dapp state, clean up from user session, etc.
  })

  return InitializedSignClient;
}

/*
 * Connect the application and specify session permissions.
 */
document.getElementById('open-modal')!.onclick = async function openModal() {
  signClient = await initializeWalletConnect();

  const projectId = sessionStorage.getItem('projectId')!;
  // Create WalletConnectModal instance
  const walletConnectModal = new WalletConnectModal({
    projectId,
    chains: ['hedera:testnet'],
  })

  try {
    const { uri, approval } = await signClient.connect({
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
      // Await session approval from the wallet.
      await approval()

      ////////////////////////////////////////////////////////
      // Handle the returned session (e.g. update UI to "connected" state).
      // * onSessionConnect(session) *
      ////////////////////////////////////////////////////////

      // Close the QRCode modal in case it was open.
      walletConnectModal.closeModal()

      alert('Connected!')
    }
  } catch (err) {
    console.log(err);
  }
}
/*
 * Sample transaction
 */

document.getElementById('sign-execute-transaction')!.onclick =
  async function signExecuteTransaction() {
    try {
      console.log('sign-execute-transaction');
      const sendHbarTo = prompt('Where would you like to send 100 hbar to?', '0.0.450178')
  
      if (!sendHbarTo) return;
      
      const lastKeyIndex = signClient.session.getAll().length - 1;
      const walletConnectSession = signClient.session.getAll()[lastKeyIndex];

      const payerAccountId = AccountId.fromString(
        walletConnectSession.namespaces?.hedera?.accounts?.[0]?.split(':')?.[2],
      )
  
      // Create a transaction to transfer 100 hbars
      const transaction = new TransferTransaction()
        .setNodeAccountIds([new AccountId(3)]) // Useless here I guess.
        .setTransactionId(TransactionId.generate(payerAccountId))
        .addHbarTransfer(payerAccountId, new Hbar(-100))
        .addHbarTransfer(sendHbarTo, new Hbar(100))
        .freeze() // Freeze this transaction from further modification to prepare for signing or serialization. 
        .toBytes()
  
      const params = {
        bodyBytes: Buffer.from(transaction).toString('base64'),
        // sigMap: undefined
      }

      const response = await signClient.request({
        topic: walletConnectSession.topic,
        chainId: 'hedera:testnet',
        request: {
          method: 'hedera_signAndExecuteTransaction',
          params,
        },
      });

      console.log(response);
      alert(`Response: ${response} \rLook in the console for more information!`);
    } catch (err) {
      console.log(err);
    }
  }