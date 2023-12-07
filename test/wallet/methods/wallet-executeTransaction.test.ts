import { TopicCreateTransaction } from '@hashgraph/sdk'
import { HederaChainId, SignAndExecuteTransactionResponse, Wallet } from '../../../src'
import {
  prepareTestTransaction,
  projectId,
  requestId,
  requestTopic,
  testPrivateKeyECDSA,
  testUserAccountId,
  useJsonFixture,
  walletMetadata,
} from '../../_helpers'

describe(Wallet.name, () => {
  describe('executeTransaction', () => {
    it('should execute signed transaction, returning the transaction response', async () => {
      const wallet = await Wallet.create(projectId, walletMetadata)

      const hederaWallet = wallet!.getHederaWallet(
        HederaChainId.Testnet,
        testUserAccountId.toString(),
        testPrivateKeyECDSA,
      )

      const signerCallMock = jest.spyOn(hederaWallet, 'call')
      signerCallMock.mockImplementation(async () => {}) // Mocking the 'call' method to do nothing

      const transaction = prepareTestTransaction(new TopicCreateTransaction(), {
        freeze: true,
      })
      const signedTranasction = await hederaWallet.signTransaction(transaction)

      const respondSessionRequestSpy = jest.spyOn(wallet, 'respondSessionRequest')

      try {
        await wallet.hedera_executeTransaction(
          requestId,
          requestTopic,
          [signedTranasction],
          hederaWallet,
        )
      } catch (err) {}

      const mockResponse: SignAndExecuteTransactionResponse = useJsonFixture(
        'methods/executeTransactionSuccess',
      )

      expect(respondSessionRequestSpy).toHaveBeenCalledWith(mockResponse)
    }, 15_000)
  })
})
