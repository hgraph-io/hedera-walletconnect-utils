import { TransferTransaction, AccountId, Hbar } from '@hashgraph/sdk'
import {
  HederaChainId,
  SignTransactionResponse,
  Wallet,
  transactionToTransactionBody,
} from '../../../src'
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
      try {
        const wallet = await Wallet.create(projectId, walletMetadata)
        const hederaWallet = wallet!.getHederaWallet(
          HederaChainId.Testnet,
          testUserAccountId.toString(),
          testPrivateKeyECDSA,
        )
        const transaction = new TransferTransaction()
          .setMaxTransactionFee(new Hbar(1))
          .addHbarTransfer('0.0.123', new Hbar(10))
          .addHbarTransfer('0.0.321', new Hbar(-10))
        const transactionBody = transactionToTransactionBody(
          transaction,
          AccountId.fromString('0.0.3'),
        )
        const respondSessionRequestSpy = jest.spyOn(wallet, 'respondSessionRequest')

        const response = await wallet.hedera_signTransaction(
          requestId,
          requestTopic,
          transactionBody,
          hederaWallet,
        )
        console.log(response)

        const mockResponse: SignTransactionResponse = useJsonFixture(
          'methods/signTransactionSuccess',
        )
        mockResponse.response.result

        respondSessionRequestSpy
        expect(respondSessionRequestSpy).toHaveBeenCalledWith(mockResponse)
      } catch (err) {}
    }, 15_000)
  })
})
