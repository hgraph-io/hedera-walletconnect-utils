import { HederaChainId, SignMessageResponse, Wallet } from '../../../src'
import {
  testPrivateKeyECDSA,
  testPrivateKeyED25519,
  testUserAccountId,
  walletMetadata,
  projectId,
} from '../../_helpers'

describe(Wallet.name, () => {
  describe('signMessage', () => {
    // [private key type, private key, expected value]
    const testCases = [
      [
        'ECDSA',
        testPrivateKeyECDSA,
        'CmUKIQJ4J53yGuPNMGEGJ7HkI+u3QFxUuAOa9VLEtFj7Y6qNMzJAp3vxT7kRPE9HFFm/bbArGYDQ+psNWZC70rdW2bE1L86REC5xavtsalXfGaZ7FsdkWwPg4GBUKuzmr1eFTcYdNg==',
      ],
      [
        'ED25519',
        testPrivateKeyED25519,
        'CmQKIKLvE3YbZEplGhpKxmbq+6xBnJcoL4r1wz9Y1zLnPlpVGkBtfDTfBZGf/MUbovYyLUjORErDGhDYbzPFoAbkMwRrpw2ouDRmn6Dd6A06k6yM/FhZ/VjdHVhQUd+fxv1cZqUM',
      ],
    ]
    test.each(testCases)(
      'should decode message bytes and sign with: %p',
      async (_, privateKey, expected) => {
        const wallet = await Wallet.create(projectId, walletMetadata)

        const id = 1
        const topic = 'test-topic'
        const hederaWallet = wallet!.getHederaWallet(
          HederaChainId.Testnet,
          testUserAccountId.toString(),
          privateKey,
        )
        const respondSessionRequestSpy = jest.spyOn(wallet, 'respondSessionRequest')

        try {
          await wallet.hedera_signMessage(id, topic, 'Hello Future', hederaWallet)
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
