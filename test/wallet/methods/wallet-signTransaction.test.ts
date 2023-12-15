import { TopicCreateTransaction } from '@hashgraph/sdk'
import { HederaChainId, SignTransactionResponse, Wallet } from '../../../src'
import {
  projectId,
  requestId,
  requestTopic,
  testPrivateKeyECDSA,
  testUserAccountId,
  useJsonFixture,
  walletMetadata,
} from '../../_helpers'

describe(Wallet.name, () => {
  describe('signTransaction', () => {
    it('should sign a transaction and return without executing', async () => {
      const wallet = await Wallet.create(projectId, walletMetadata)
      const hederaWallet = wallet!.getHederaWallet(
        HederaChainId.Testnet,
        testUserAccountId.toString(),
        testPrivateKeyECDSA,
      )
      const transaction = new TopicCreateTransaction()
      //@ts-ignore
      const transactionBody = transaction._makeTransactionBody(AccountId.fromString('0.0.3'))
      const respondSessionRequestSpy = jest.spyOn(wallet, 'respondSessionRequest')

      try {
        await wallet.hedera_signTransaction(
          requestId,
          requestTopic,
          transactionBody,
          hederaWallet,
        )
      } catch (err) {}

      const mockResponse: SignTransactionResponse = useJsonFixture(
        'methods/signTransactionSuccess',
      )
      mockResponse.response.result

      respondSessionRequestSpy
      expect(respondSessionRequestSpy).toHaveBeenCalledWith(mockResponse)
    }, 15_000)
  })
})
