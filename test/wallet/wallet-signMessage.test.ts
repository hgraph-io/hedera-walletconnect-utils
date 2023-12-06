import { HederaChainId, SignMessageResponse, Wallet, base64StringToMessage } from '../../src'
import { testPrivateKeyECDSA, testPrivateKeyED25519, testUserAccountId } from '../_helpers'

const PROJECT_ID = 'ce06497abf4102004138a10edd29c921'

const appMetadata = {
  name: 'Wallet Test',
  url: 'https://dapp.hedera.app',
  description: 'Hedera Hashgraph Wallet Example.',
  icons: [
    'https://cdn-assets-cloud.frontify.com/s3/frontify-cloud-files-us/eyJwYXRoIjoiZnJvbnRpZnlcL2FjY291bnRzXC8xNFwvMTQzMTI3XC9wcm9qZWN0c1wvMTgwMjE1XC9hc3NldHNcL2M3XC8zNDU0ODY3XC85ZjM1NDliYmE5MGQ2NDA0OGU0NzlhZTNiMzkyYzY4Yy0xNTY2NTkxOTQ4LmpwZyJ9:frontify:v_zJvQTCjtNploUvnSpk8S5NJB4R5eei6f7ERL2KSeQ?width=800',
  ],
}

describe(Wallet.name, () => {
  describe('signMessage', () => {
    // [private key type, private key, expected value]
    const testCases = [
      [
        'ECDSA',
        testPrivateKeyECDSA,
        'rsAgbuzDlk6bDKKAqSqu254YsrXj2YwiSw9mzK/7PvvDGV+jXTU+yfg9qePLD/UvO3/nqvsm63lY9YurfRPhcQ==',
      ],
      [
        'ED25519',
        testPrivateKeyED25519,
        'e/BPvGhCXqY4X8g1aA9VJ23/grWN6UhR3vZd9mfRCzraNHwN+PClC3JXcuQSYiZdZYcJhj3u4lTckpxur4Z0Bg==',
      ],
    ]
    test.each(testCases)(
      'should decode message bytes and sign with: %p',
      async (_, privateKey, expected) => {
        const wallet = await Wallet.create(PROJECT_ID, appMetadata)

        const id = 1
        const topic = 'test-topic'
        const messageBytes = base64StringToMessage(btoa('Hello World'))
        const hederaWallet = wallet!.getHederaWallet(
          HederaChainId.Testnet,
          testUserAccountId.toString(),
          privateKey,
        )
        const respondSessionRequest = jest.spyOn(wallet, 'respondSessionRequest')

        try {
          await wallet.hedera_signMessage(id, topic, messageBytes, hederaWallet)
        } catch (err) {}

        const mockResponse: SignMessageResponse = {
          topic,
          response: {
            jsonrpc: '2.0',
            id,
            result: {
              signatureMap: expected,
            },
          },
        }

        expect(respondSessionRequest).toHaveBeenCalledWith(mockResponse)
      },
    )
  })
})
