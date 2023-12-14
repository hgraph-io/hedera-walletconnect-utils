import { GetNodeAddresesResponse, HederaChainId, Wallet } from '../../../src'
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
  describe('getNodeAddresses', () => {
    it('should return array of nodes addresses', async () => {
      const wallet = await Wallet.create(projectId, walletMetadata)

      const hederaWallet = wallet!.getHederaWallet(
        HederaChainId.Testnet,
        testUserAccountId.toString(),
        testPrivateKeyECDSA,
      )

      const respondSessionRequestSpy = jest.spyOn(wallet, 'respondSessionRequest')

      try {
        await wallet.hedera_getNodeAddresses(requestId, requestTopic, null, hederaWallet)
      } catch (err) {}

      const mockResponse: GetNodeAddresesResponse = useJsonFixture(
        'methods/getNodeAddressesSuccess',
      )

      const callArguments = respondSessionRequestSpy.mock.calls[0][0]
      const response = callArguments as GetNodeAddresesResponse

      response.response.result.nodes.sort()
      mockResponse.response.result.nodes.sort()

      expect(response).toEqual(mockResponse)
    }, 15_000)
  })
})
