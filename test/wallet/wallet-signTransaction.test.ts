import { TopicCreateTransaction } from '@hashgraph/sdk'
import { HederaChainId, SignTransactionResponse, Wallet } from '../../src'
import {
  prepareTestTransaction,
  projectId,
  requestId,
  requestTopic,
  testPrivateKeyECDSA,
  testUserAccountId,
  useJsonFixture,
  walletMetadata,
} from '../_helpers'

describe(Wallet.name, () => {
  describe('signAndReturnTransaction', () => {
    it('should sign a transaction and return without executing', async () => {
      const wallet = await Wallet.create(projectId, walletMetadata)
      const hederaWallet = wallet!.getHederaWallet(
        HederaChainId.Testnet,
        testUserAccountId.toString(),
        testPrivateKeyECDSA,
      )
      const transaction = prepareTestTransaction(new TopicCreateTransaction(), { freeze: true })
      const respondSessionRequestSpy = jest.spyOn(wallet, 'respondSessionRequest')

      try {
        await wallet.hedera_signTransaction(
          requestId,
          requestTopic,
          [transaction],
          hederaWallet,
        )
      } catch (err) {}

      const mockResponse: SignTransactionResponse = useJsonFixture('signTransactionSuccess')

      expect(respondSessionRequestSpy).toHaveBeenCalledWith(mockResponse)
    }, 15_000)
  })
})
