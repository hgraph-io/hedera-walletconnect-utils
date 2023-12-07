import { HederaChainId, SignMessageResponse, Wallet, base64StringToMessage } from '../../src'
import {
  testPrivateKeyECDSA,
  testPrivateKeyED25519,
  testUserAccountId,
  walletMetadata,
  projectId,
} from '../_helpers'

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
        const wallet = await Wallet.create(projectId, walletMetadata)

        const id = 1
        const topic = 'test-topic'
        const messageBytes = base64StringToMessage(btoa('Hello World'))
        const hederaWallet = wallet!.getHederaWallet(
          HederaChainId.Testnet,
          testUserAccountId.toString(),
          privateKey,
        )
        const respondSessionRequestSpy = jest.spyOn(wallet, 'respondSessionRequest')

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

        expect(respondSessionRequestSpy).toHaveBeenCalledWith(mockResponse)
      },
    )
  })
})
