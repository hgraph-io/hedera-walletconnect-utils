import { AccountId, Transaction, TransactionId } from '@hashgraph/sdk'

export const testUserAccountId = new AccountId(12345)
export const testNodeAccountId = new AccountId(3)
export const testTransactionId = TransactionId.generate(testUserAccountId)

export function prepareTestTransaction<T extends Transaction = Transaction>(transaction: T): T {
  transaction.setNodeAccountIds([testNodeAccountId])
  transaction.setTransactionId(testTransactionId)
  return transaction
}

// from PrivateKey.generateECDSA().toStringDer()
export const testPrivateKeyECDSA =
  '3030020100300706052b8104000a042204203ce31ffad30d6db47c315bbea08232aad2266d8800a12aa3d8a812486e782759'
// from PrivateKey.generateED25519().toStringDer()
export const testPrivateKeyED25519 =
  '302e020100300506032b657004220420133eefea772add1f995c96bccf42b08b76daf67665f0c4c5ae308fae9275c142'
