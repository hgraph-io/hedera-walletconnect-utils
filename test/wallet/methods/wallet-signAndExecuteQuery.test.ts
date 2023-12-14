import { AccountInfo, AccountInfoQuery } from '@hashgraph/sdk'
import {
  HederaChainId,
  SignAndExecuteTransactionResponse,
  Wallet,
  base64StringToUint8Array,
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
  describe('signAndExecuteQuery', () => {
    it('should sign and execute query, returning the query response', async () => {
      const wallet = await Wallet.create(projectId, walletMetadata)

      const hederaWallet = wallet!.getHederaWallet(
        HederaChainId.Testnet,
        testUserAccountId.toString(),
        testPrivateKeyECDSA,
      )
      const query = new AccountInfoQuery().setAccountId(testUserAccountId)
      const respondSessionRequestSpy = jest.spyOn(wallet, 'respondSessionRequest')

      const signerCallMock = jest.spyOn(query, 'executeWithSigner')
      const toBytes = () => base64StringToUint8Array(btoa('Hello World!'))
      signerCallMock.mockImplementation(async () => ({ toBytes }) as AccountInfo)

      try {
        await wallet.hedera_signAndExecuteQuery(requestId, requestTopic, query, hederaWallet)
      } catch (err) {}

      const mockResponse: SignAndExecuteTransactionResponse = useJsonFixture(
        'methods/signAndExecuteQuerySuccess',
      )

      expect(respondSessionRequestSpy).toHaveBeenCalledWith(mockResponse)
    }, 15_000)
  })
})
