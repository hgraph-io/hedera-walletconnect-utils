const projectId = '37bc1dca96ab6ad2ba983b9a9362bcc6'
import SignClient from '@walletconnect/sign-client'
import { WalletConnectModal } from '@walletconnect/modal'
import {
  AccountId,
  TransactionId,
  TransferTransaction,
  Hbar,
  RequestType,
} from '@hashgraph/sdk'
// import { HederaSessionRequest } from '@hashgraph/walletconnect'

/*
 * https://docs.walletconnect.com/2.0/api/sign/dapp-usage
 */

/*
 * Create a session
 *
 * 1. Initiate Sign Client
 */
async function main() {
  const signClient = await SignClient.init({
    projectId,
    metadata: {
      name: 'cool dApp',
      description: 'this is a really cool dApp',
      url: 'https://hgraph.app',
      icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
  })

  /*
   * 2. Add listeners
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

  /*
   * 3. Create WalletConnectModal instance
   */
  const walletConnectModal = new WalletConnectModal({
    projectId,
    chains: ['hedera:testnet'],
  })

  /*
   * 4. Connect the application and specify session permissions.
   */
  document.getElementById('open-modal').onclick = async function openModal() {
    const { uri, approval } = await signClient.connect({
      // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
      requiredNamespaces: {
        hedera: {
          methods: [
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
      const session = await approval()
      // Handle the returned session (e.g. update UI to "connected" state).
      alert('Connected!')
      sessionStorage.setItem('session', JSON.stringify(session))
      // Close the QRCode modal in case it was open.
      walletConnectModal.closeModal()
    }
  }

  /*
   * Sample transactions
   */

  document.getElementById('sign-execute-transaction').onclick =
    async function signExecuteTransaction() {
      const payerAccountId = new AccountId(1234)
      const nodeAccountIds = [new AccountId(3)]
      const transactionId = TransactionId.generate(payerAccountId)

      const transaction = new TransferTransaction()
        .setTransactionId(transactionId)
        .setNodeAccountIds(nodeAccountIds)
        .addHbarTransfer(payerAccountId, new Hbar(-100))
        .addHbarTransfer('0.0.4321', new Hbar(100))

      // const payload = HederaSessionRequest.create({
      //   chainId: 'hedera:testnet',
      //   topic: JSON.parse(sessionStorage.getItem('session'))?.topic,
      // }).buildSignAndExecuteTransactionRequest(RequestType.CryptoTransfer, transaction)

      // const result = await signClient.request(payload)

      // console.log(result)
    }
}
main()
