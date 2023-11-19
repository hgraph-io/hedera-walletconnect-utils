// https://github.com/WalletConnect/walletconnect-monorepo/tree/v2.0/packages/web3wallet
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import { getSdkError } from '@walletconnect/utils'
import { AccountId } from '@hashgraph/sdk'
import { Wallet } from '@hashgraph/walletconnect'
import { loadState, saveState, getState } from '../shared'

// referenced in handlers
var wallet: Wallet | undefined
loadState() // load previous state if it exists

/*
 * Initialize wallet
 */
async function init(e: Event) {
  e.preventDefault()
  const form = new FormData(e.target as HTMLFormElement)
  saveState(form)

  const projectId = form.get('project-id') as string
  const metadata: Web3WalletTypes.Metadata = {
    name: form.get('name') as string,
    description: form.get('description') as string,
    url: form.get('url') as string,
    icons: [form.get('icons') as string],
  }

  wallet = await Wallet.create(projectId, metadata)

  /*
   * Add listeners
   */
  // called after pairing to set parameters of session, i.e. accounts, chains, methods, events
  wallet.on('session_proposal', async (proposal: Web3WalletTypes.SessionProposal) => {
    // Client logic: prompt for approval of accounts
    const accountId = getState('account-id')
    const accounts: string[] = [`hedera:testnet:${accountId}`]

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
    const { method, body, account } = wallet.parseSessionRequest(event)
    if (
      !confirm(
        `Do you want to proceed with this transaction?: ${JSON.stringify({
          method,
          body,
          account,
        })}`,
      )
    )
      throw getSdkError('USER_REJECTED_METHODS')

    // A custom provider/signer can be used to sign transactions
    // https://docs.hedera.com/hedera/sdks-and-apis/sdks/signature-provider/wallet
    const hederaWallet = wallet.getHederaWallet(account, getState('private-key'))

    return await wallet.executeSessionRequest(event, hederaWallet)
  })
}

document.querySelector<HTMLFormElement>('#init').onsubmit = init
/*
 * Handle pairing event on initialized wallet
 */
async function pair(e: Event) {
  e.preventDefault()
  const form = new FormData(e.target as HTMLFormElement)
  saveState(form)
  const uri = form.get('uri') as string
  wallet.core.pairing.pair({ uri })
}

document.querySelector<HTMLFormElement>('#pair').onsubmit = pair

/*
 * Handle adding a hedera account
 */
async function addHederaAccount(e: Event) {
  e.preventDefault()
  const form = new FormData(e.target as HTMLFormElement)
  saveState(form)
}

document.querySelector<HTMLFormElement>('#set-account').onsubmit = addHederaAccount

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
