const projectId = 'fc2d1e07b0352b11991711847a458e4e'
import SignClient from '@walletconnect/sign-client'

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
      name: 'Slick Wallet',
      description: 'This is a slick wallet!',
      url: 'https://hgraph.app',
      icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
  })

  /*
   * 2. Add listeners
   */

  signClient.on('session_proposal', async (event) => {
    console.log('session_proposal')
    console.log(event)
    const {
      id,
      params: { requiredNamespaces },
    } = event
    const { topic, acknowledged } = await signClient.approve({
      id,
      namespaces: {
        hedera: {
          accounts: ['hedera:testnet:0.0.1234'],
          methods: requiredNamespaces.hedera.methods,
          events: requiredNamespaces.hedera.events,
        },
      },
    })
  })

  signClient.on('session_update', ({ topic, params }) => {
    console.log('session_update')
    const { namespaces } = params
    const _session = signClient.session.get(topic)
    // Overwrite the `namespaces` of the existing session with the incoming one.
    const updatedSession = { ..._session, namespaces }
    // Integrate the updated session state into your dapp state.
    console.log(updatedSession)
  })

  signClient.on('session_delete', () => {
    console.log('session deleted')
    // Session was deleted -> reset the dapp state, clean up from user session, etc.
  })

  /*
   * 3. Create a session
   */
  // @ts-ignore
  window.pair = async function pair() {
    // @ts-ignore
    const uri = document.querySelector('input[name="uri"]')?.value
    if (!uri) throw new Error('No URI')
    const session = await signClient.core.pairing.pair({ uri })
    // console.log(session)
    // const { topic, acknowledged } = await signClient.approve({
    //   id: 123,
    //   namespaces: {
    //     eip155: {
    //       accounts: ['hedera:testnet:0.0.1234'],
    //       methods: ['hedera_signAndReturnTransaction'],
    //       events: ['accountsChanged'],
    //     },
    //   },
    // })
    // console.log(topic)
    // console.log(acknowledged)
  }
}
main()
