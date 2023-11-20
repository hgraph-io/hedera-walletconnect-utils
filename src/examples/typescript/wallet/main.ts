// https://github.com/WalletConnect/walletconnect-monorepo/tree/v2.0/packages/web3wallet
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import { getSdkError } from '@walletconnect/utils'
import { Wallet, HederaChainId } from '../../../lib'
import { loadState, saveState } from '../shared'

// referenced in handlers
var wallet: Wallet | undefined
loadState() // load previous state if it exists

/*
 * Initialize wallet
 */
async function init(e: Event) {
  const state = saveState(e)

  const projectId = state['project-id']
  const metadata: Web3WalletTypes.Metadata = {
    name: state['name'],
    description: state['description'],
    url: state['url'],
    icons: [state['icons']],
  }

  wallet = await Wallet.create(projectId, metadata)

  /*
   * Add listeners
   */
  // called after pairing to set parameters of session, i.e. accounts, chains, methods, events
  wallet.on('session_proposal', async (proposal: Web3WalletTypes.SessionProposal) => {
    // Client logic: prompt for approval of accounts
    const accountId = state['account-id']
    const chainId = HederaChainId.Testnet
    const accounts: string[] = [`${chainId}:${accountId}`]

    if (confirm(`Do you want to connect to this session?: ${JSON.stringify(proposal)}`))
      wallet.buildAndApproveSession(accounts, proposal)
    else
      await wallet.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED_METHODS'),
      })
  })

  // requests to call a JSON-RPC method
  wallet.on('session_request', async (event: Web3WalletTypes.SessionRequest) => {
    // Client logic: prompt user for approval of transaction
    const { chainId } = wallet.parseSessionRequest(event)

    // A custom provider/signer can be used to sign transactions
    // https://docs.hedera.com/hedera/sdks-and-apis/sdks/signature-provider/wallet
    const hederaWallet = wallet.getHederaWallet(chainId, state['account-id'], state['private-key'])
    
    return await wallet.executeSessionRequest(event, hederaWallet)
  })

  console.log('-'.repeat(10));
  console.log('Wallet: WalletConnect initialized!');
  console.log('-'.repeat(10));
}

document.querySelector<HTMLFormElement>('#init').onsubmit = init
/*
 * Handle pairing event on initialized wallet
 */
async function pair(e: Event) {
  const { uri } = saveState(e)
  wallet.core.pairing.pair({ uri });

  console.log('-'.repeat(10));
  console.log('wallet: WalletConnect initialized!');
  console.log('-'.repeat(10));
}

document.querySelector<HTMLFormElement>('#pair').onsubmit = pair

/*
 * Handle adding a hedera account
 */
document.querySelector<HTMLFormElement>('#set-account').onsubmit = function (event) {
  saveState(event);

  console.log('-'.repeat(10));
  console.log('Account saved!');
  console.log('-'.repeat(10));
}

/*
 * Handle changes in wallet
 */
async function disconnect(e: Event) {
  e.preventDefault()
  for (const [key, value] of Object.entries(wallet.getActiveSessions())) {
    await wallet.disconnectSession({
      topic: value.topic,
      reason: getSdkError('USER_DISCONNECTED'),
    })
  }
}
document.querySelector<HTMLFormElement>('#disconnect').onsubmit = disconnect
// await web3wallet.updateSession({ topic, namespaces: newNs });
