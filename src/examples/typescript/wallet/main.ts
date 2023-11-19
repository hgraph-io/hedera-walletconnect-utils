import { type Web3WalletTypes } from '@walletconnect/web3wallet'
import { getSdkError } from '@walletconnect/utils'
import { AccountId } from '@hashgraph/sdk'
import { Wallet } from '@hashgraph/walletconnect'

// referenced in handlers
var wallet: Wallet | undefined

// load saved params
const savedData = JSON.parse(localStorage.getItem('wc-hedera-demo') || '[]')
for (const [key, value] of savedData)
  document.querySelector<HTMLInputElement>(key)?.setAttribute('value', value)

/*
 * Initialize wallet
 */
async function init(e: Event) {
  const form = new FormData(e.target as HTMLFormElement)

  const projectId = form.get('project-id') as string
  const metadata = JSON.parse(form.get('metadata') as string)

  wallet = await Wallet.create(projectId, metadata)

  /*
   * Add listeners
   */
  wallet.on('session_proposal', async (proposal: Web3WalletTypes.SessionProposal) => {
    // Client logic: prompt for approval of accounts
    const accountId = AccountId.fromString(localStorage.getItem('account-id'))
    const accounts: string[] = [`hedera:testnet:${accountId}`]

    if (confirm(`Do you want to connect to this session?: ${JSON.stringify(proposal)}`))
      wallet.buildAndApproveSession(accounts, proposal)
    else
      await wallet.rejectSession({
        id: proposal.id,
        reason: getSdkError('USER_REJECTED_METHODS'),
      })
  })

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

    const privateKey = localStorage.getItem('private-key')
    const hederaWallet = wallet.getHederaWallet(account, privateKey) // Can also use a custom signer / provider

    return await wallet.call(event, hederaWallet)
  })
}

document.querySelector<HTMLFormElement>('#init').onsubmit = async (e: Event) => {
  e.preventDefault()
  await init(e)
}
/*
 * Handle pairing event on initialized wallet
 */
async function pair(event: Event) {
  const form = new FormData(event.target as HTMLFormElement)
  const uri = form.get('uri') as string
  wallet.core.pairing.pair({ uri })
}
document.querySelector<HTMLFormElement>('#pair').onsubmit = async (e: Event) => {
  e.preventDefault()
  await pair(e)
}

document.querySelector<HTMLFormElement>('#set-account').onsubmit = (e: Event) => {
  e.preventDefault()
  const form = new FormData(e.target as HTMLFormElement)
  localStorage.setItem('account-id', form.get('account-id') as string)
  localStorage.setItem('private-key', form.get('private-key') as string)
}

/*
 * Handle changes in wallet
 */
// await web3wallet.updateSession({ topic, namespaces: newNs });
// await web3wallet.disconnectSession({
// topic,
// reason: getSdkError("USER_DISCONNECTED"),
// });
