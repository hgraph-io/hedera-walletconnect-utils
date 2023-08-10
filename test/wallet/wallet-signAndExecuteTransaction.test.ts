import { TopicCreateTransaction, Transaction } from '@hashgraph/sdk'
import { HederaWallet } from '../../src'
import { prepareTestTransaction, testPrivateKeyECDSA, useJsonFixture } from '../_helpers'

jest.useFakeTimers()

describe(HederaWallet.name, () => {
  describe.only('signAndExecuteTransaction', () => {
    it('should sign and execute, returning the transaction response and receipt', async () => {
      const mockResult = useJsonFixture('signAndExecuteTransactionSuccess.json')
      const wallet = HederaWallet.init({
        network: 'testnet',
        accountId: 12345,
        privateKey: testPrivateKeyECDSA,
      })
      const transaction = prepareTestTransaction(new TopicCreateTransaction(), {
        freeze: true,
      })
      const transactionExecuteSpy = jest
        .spyOn(Transaction.prototype, 'execute')
        .mockImplementation(async () => {
          return {
            getReceipt: () => mockResult.receipt,
            toJSON: () => mockResult.response,
          } as any
        })
      const result = await wallet.signAndExecuteTransaction(transaction)
      expect(result).toEqual(mockResult)
      transactionExecuteSpy.mockRestore()
    })
  })
})
