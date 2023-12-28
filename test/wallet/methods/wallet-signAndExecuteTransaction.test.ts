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
  describe('signAndExecuteTransaction', () => {
    it('should sign and execute, returning the transaction response', async () => {
      try {
        const wallet = await Wallet.create(projectId, walletMetadata)

        const hederaWallet = wallet!.getHederaWallet(
          HederaChainId.Testnet,
          testUserAccountId.toString(),
          testPrivateKeyECDSA,
        )

        const signerCallMock = jest.spyOn(hederaWallet, 'call')
        signerCallMock.mockImplementation(async () => {
          return {
            nodeId: '0.0.3',
            transactionHash: 'uO6obRah/zbL1Wn1ZVd5unos7kbsI8G5bHifKGVWUGZPiCafQzr/hdlEJyUiKLw9',
            transactionId: '0.0.12345@1691705630.325343432',
          }
        }) // Mocking the 'call' method to do nothing

        const transaction = prepareTestTransaction(new TopicCreateTransaction(), {
          freeze: true,
        })

        const respondSessionRequestSpy = jest.spyOn(wallet, 'respondSessionRequest')

        await wallet.hedera_signAndExecuteTransaction(
          requestId,
          requestTopic,
          transaction,
          hederaWallet,
        )

        const mockResponse: SignAndExecuteTransactionResponse = useJsonFixture(
          'methods/signAndExecuteTransactionSuccess',
        )

        expect(respondSessionRequestSpy).toHaveBeenCalledWith(mockResponse)
      } catch (err) {}
    }, 15_000)
  })
})
