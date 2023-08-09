import { AccountId, Transaction, TransactionId } from '@hashgraph/sdk'

export const testUserAccountId = new AccountId(12345)
export const testNodeAccountId = new AccountId(3)
export const testTransactionId = TransactionId.generate(testUserAccountId)

export function prepareTestTransaction<T extends Transaction = Transaction>(transaction: T): T {
  transaction.setNodeAccountIds([testNodeAccountId])
  transaction.setTransactionId(testTransactionId)
  return transaction
}
