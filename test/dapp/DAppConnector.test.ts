import { LedgerId } from '@hashgraph/sdk'
import { DAppConnector } from '../../src'

const PROJECT_ID = 'ce06497abf4102004138a10edd29c921'

const appMetadata = {
  name: 'DApp Test',
  url: 'https://dapp.hedera.app',
  description: 'Hedera Hashgraph DApp Example.',
  icons: [
    'https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZnlcL2FjY291bnRzXC8xNFwvMTQzMTI3XC9wcm9qZWN0c1wvMTgwMjE1XC9hc3NldHNcL2M3XC8zNDU0ODY3XC85ZjM1NDliYmE5MGQ2NDA0OGU0NzlhZTNiMzkyYzY4Yy0xNTY2NTkxOTQ4LmpwZyJ9:frontify:v_zJvQTCjtNploUvnSpk8S5NJB4R5eei6f7ERL2KSeQ?width=800',
  ],
}

describe('DAppConnector', () => {
  let connector: DAppConnector

  describe('connect', () => {
    it('should stablish connection and create session', async () => {
      connector = new DAppConnector(appMetadata, LedgerId.TESTNET, PROJECT_ID)
      await connector.init()
      expect(connector.walletConnectClient).not.toBeNull()

      await connector.connect((pairing) => {
        console.log('PairingString: ', pairing)
      })
      expect(connector.walletConnectClient?.session.getAll()).toHaveLength(1)
    }, 60_000)
  })
})
