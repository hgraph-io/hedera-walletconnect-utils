import {
  AccountId,
  AccountInfo,
  AccountInfoQuery,
  LedgerId,
  Query,
  TopicCreateTransaction,
} from '@hashgraph/sdk'
import {
  transactionToBase64String,
  freezeTransaction,
  setDefaultNodeAccountIds,
  base64StringToTransaction,
  base64StringToUint8Array,
  Uint8ArrayToBase64String,
  base64StringToQuery,
  queryToBase64String,
  messageToBase64String,
  base64StringToMessage,
  EIPChainIdToLedgerId,
  ledgerIdToEIPChainId,
  CAIPChainIdToLedgerId,
  HederaChainId,
  ledgerIdToCAIPChainId,
  networkNameToCAIPChainId,
  networkNameToEIPChainId,
  networkNamespaces,
  HederaSessionEvent,
} from '../src'
import { prepareTestTransaction, testUserAccountId, useJsonFixture } from './_helpers'

describe(freezeTransaction.name, () => {
  it('should freeze an unfrozen transaction', () => {
    const txn = prepareTestTransaction(new TopicCreateTransaction())

    expect(txn.isFrozen()).toBe(false)

    freezeTransaction(txn)

    expect(txn.isFrozen()).toBe(true)
  })

  it('should have no effect on a frozen transaction', () => {
    const txn = prepareTestTransaction(new TopicCreateTransaction())
    txn.freeze()

    expect(txn.isFrozen()).toBe(true)

    freezeTransaction(txn)

    expect(txn.isFrozen()).toBe(true)
  })
})

describe(setDefaultNodeAccountIds.name, () => {
  it('should set default node account ids if none are set', () => {
    const txn = new TopicCreateTransaction()

    expect(txn.nodeAccountIds).toBeNull()

    setDefaultNodeAccountIds(txn)
    const result = txn.nodeAccountIds?.map((id) => id.toString())

    expect(result).toEqual(['0.0.3'])
  })

  it('should do nothing if node account ids are already set', () => {
    const txn = new TopicCreateTransaction()
    txn.setNodeAccountIds([new AccountId(4)])

    setDefaultNodeAccountIds(txn)
    const result = txn.nodeAccountIds?.map((id) => id.toString())

    expect(result).toEqual(['0.0.4'])
  })
})

describe(transactionToBase64String.name, () => {
  it('should convert a transaction to a base64 encoded string', () => {
    const txn = prepareTestTransaction(new TopicCreateTransaction())
    const result = transactionToBase64String(txn)
    const { expected } = useJsonFixture('transactionToBase64StringResult')

    expect(result).toBe(expected)
  })
})

describe(base64StringToTransaction.name, () => {
  it('should create a transaction from a base64 string', () => {
    const txn = prepareTestTransaction(new TopicCreateTransaction())
    txn.setTransactionMemo('I should be restored')
    const str = transactionToBase64String(txn)

    const resultWithParam = base64StringToTransaction<TopicCreateTransaction>(str)
    const resultWithoutParam = base64StringToTransaction(str)

    expect(resultWithParam).toBeInstanceOf(TopicCreateTransaction)
    expect(resultWithoutParam).toBeInstanceOf(TopicCreateTransaction)
    expect(resultWithParam.transactionMemo).toBe('I should be restored')
  })
})

// TODO: remake it after fixes
// describe('SignatureMap helpers', () => {
//   let base64SignatureMap: string

//   describe(signatureMapToBase64.name, () => {
//     it('should encode SignatureMap to base64 string', async() => {
//       const txn = prepareTestTransaction(new TopicCreateTransaction(), {freeze: true})
//       const wallet = await Wallet.create(projectId, walletMetadata)
//       const hederaWallet = wallet!.getHederaWallet(
//         HederaChainId.Testnet,
//         testUserAccountId,
//         testPrivateKeyECDSA,
//       )

//       const signedTxn = await hederaWallet.signTransaction(txn)
//       const signatureMap = signedTxn.getSignatures()
//       base64SignatureMap = signatureMapToBase64(signatureMap)

//       expect(typeof base64SignatureMap).toBe('string')
//       expect(base64SignatureMap).toBe('eyIwLjAuMyI6eyIzMDJkMzAwNzA2MDUyYjgxMDQwMDBhMDMyMjAwMDI3ODI3OWRmMjFhZTNjZDMwNjEwNjI3YjFlNDIzZWJiNzQwNWM1NGI4MDM5YWY1NTJjNGI0NThmYjYzYWE4ZDMzIjp7IjAiOjE0MywiMSI6MjUxLCIyIjoyNCwiMyI6MTQwLCI0IjoyNTEsIjUiOjEwNywiNiI6MTQsIjciOjY3LCI4Ijo5MiwiOSI6MTI0LCIxMCI6MTM1LCIxMSI6NjMsIjEyIjoxMDksIjEzIjoyNCwiMTQiOjEsIjE1IjowLCIxNiI6MTgsIjE3IjoyMjQsIjE4IjoyMiwiMTkiOjI4LCIyMCI6MzcsIjIxIjo4MywiMjIiOjI5LCIyMyI6MTkxLCIyNCI6MjEzLCIyNSI6MTc2LCIyNiI6MjA4LCIyNyI6MTcwLCIyOCI6MTIsIjI5IjoxMzMsIjMwIjoyMjcsIjMxIjo3NiwiMzIiOjE3NywiMzMiOjEzNSwiMzQiOjIwLCIzNSI6NzksIjM2IjoxODYsIjM3IjoxNTAsIjM4IjoxLCIzOSI6MjEzLCI0MCI6ODQsIjQxIjoxMTMsIjQyIjoyNTMsIjQzIjo1OCwiNDQiOjI0OSwiNDUiOjE4MCwiNDYiOjIxNSwiNDciOjg1LCI0OCI6MTg4LCI0OSI6MTU3LCI1MCI6MTk5LCI1MSI6MjIwLCI1MiI6MTM1LCI1MyI6MjMxLCI1NCI6MjEzLCI1NSI6MTA4LCI1NiI6MTg0LCI1NyI6MjM5LCI1OCI6MTUyLCI1OSI6MjM2LCI2MCI6MTI1LCI2MSI6MjI2LCI2MiI6MjQ2LCI2MyI6MjUyfX19')
//     })
//   })

//   describe(base64StringToSignatureMap.name, () => {
//     it('should decode base64 string to SignatureMap', async() => {
//       const signatureMap = base64StringToSignatureMap(base64SignatureMap)
//       console.log(JSON.stringify(signatureMap, null, 2))
//       expect(signatureMap).toBe(???)
//     })
//   })
// })

describe(`Uint8Array helpers`, () => {
  let uInt8Array: Uint8Array

  describe(base64StringToUint8Array.name, () => {
    it('should decode base64 string to Uint8Array', async () => {
      const base64String = btoa('Hello World!')
      uInt8Array = base64StringToUint8Array(base64String)

      console.log(Array.from(uInt8Array))
      expect(uInt8Array).toBeInstanceOf(Uint8Array)
      expect(Array.from(uInt8Array)).toEqual([
        72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
      ])
    })
  })

  describe(Uint8ArrayToBase64String.name, () => {
    it('should encode Uint8Array to base64 string', async () => {
      const base64String = Uint8ArrayToBase64String(uInt8Array)

      expect(typeof base64String).toBe('string')
      expect(base64String).toBe('SGVsbG8gV29ybGQh')
      expect(atob(base64String)).toBe('Hello World!')
    })
  })
})

describe(`Query helpers`, () => {
  let base64Query: string

  describe(queryToBase64String.name, () => {
    it('should encode Query to base64 string', async () => {
      const query = new AccountInfoQuery().setAccountId(testUserAccountId)

      base64Query = queryToBase64String(query)

      expect(typeof base64Query).toBe('string')
      expect(base64Query).toEqual('Sg0KAhAAEgcIABAAGLlg')
    })
  })

  describe(base64StringToQuery.name, () => {
    it('should decode base64 string to Query', async () => {
      const query = base64StringToQuery<AccountInfo, AccountInfoQuery>(base64Query)

      expect(query).toBeInstanceOf(Query)
      expect(query).toBeInstanceOf(AccountInfoQuery)
      expect(query.accountId?.toString()).toBe(testUserAccountId.toString())
    })
  })
})

describe(`Message helpers`, () => {
  let base64Message: string

  describe(messageToBase64String.name, () => {
    it('should encode message to base64 string', async () => {
      const message = 'test'
      base64Message = messageToBase64String(message)

      expect(typeof base64Message).toBe('string')
      expect(base64Message).toEqual('dGVzdA==')
    })
  })

  describe(base64StringToMessage.name, () => {
    it('should encode base64 string to Uint8Array', async () => {
      const uInt8ArrayMessage = base64StringToMessage(base64Message)

      expect(uInt8ArrayMessage[0]).toBeInstanceOf(Uint8Array)
      expect(Array.from(uInt8ArrayMessage[0])).toEqual([
        25, 72, 101, 100, 101, 114, 97, 32, 83, 105, 103, 110, 101, 100, 32, 77, 101, 115, 115,
        97, 103, 101, 58, 10, 52, 116, 101, 115, 116,
      ])
    })
  })
})

describe(EIPChainIdToLedgerId.name, () => {
  it('should convert a EIP chain id to a LedgerId object', async () => {
    const mainnetLedgerId = EIPChainIdToLedgerId(295)
    const testnetLedgerId = EIPChainIdToLedgerId(296)
    const previewnetLedgerId = EIPChainIdToLedgerId(297)
    const localnodeLedgerId = EIPChainIdToLedgerId(298)
    const localnodeLedgerIdWithRandomId = EIPChainIdToLedgerId(999)

    expect(mainnetLedgerId).toBe(LedgerId.MAINNET)
    expect(testnetLedgerId).toBe(LedgerId.TESTNET)
    expect(previewnetLedgerId).toBe(LedgerId.PREVIEWNET)
    expect(localnodeLedgerId).toBe(LedgerId.LOCAL_NODE)
    expect(localnodeLedgerIdWithRandomId).toBe(LedgerId.LOCAL_NODE)
  })
})

describe(ledgerIdToEIPChainId.name, () => {
  it('should convert a LedgerId object to a EIP chain id', async () => {
    const mainnetChainId = ledgerIdToEIPChainId(LedgerId.MAINNET)
    const testnetChainId = ledgerIdToEIPChainId(LedgerId.TESTNET)
    const previewnetChainId = ledgerIdToEIPChainId(LedgerId.PREVIEWNET)
    const localnodeChainId = ledgerIdToEIPChainId(LedgerId.LOCAL_NODE)

    expect(mainnetChainId).toBe(295)
    expect(testnetChainId).toBe(296)
    expect(previewnetChainId).toBe(297)
    expect(localnodeChainId).toBe(298)
  })
})

describe(networkNameToEIPChainId.name, () => {
  it('should convert a network name to a EIP chain id', async () => {
    const mainnetChainId = networkNameToEIPChainId('mainnet')
    const testnetChainId = networkNameToEIPChainId('testnet')
    const previewnetChainId = networkNameToEIPChainId('previewnet')
    const localnodeChainId = networkNameToEIPChainId('devnet')

    expect(mainnetChainId).toBe(295)
    expect(testnetChainId).toBe(296)
    expect(previewnetChainId).toBe(297)
    expect(localnodeChainId).toBe(298)
  })
})

describe(CAIPChainIdToLedgerId.name, () => {
  it('should convert a CAIP chain id to a LedgerId object', async () => {
    const mainnetLedgerId = CAIPChainIdToLedgerId(HederaChainId.Mainnet)
    const testnetLedgerId = CAIPChainIdToLedgerId(HederaChainId.Testnet)
    const previewnetLedgerId = CAIPChainIdToLedgerId(HederaChainId.Previewnet)
    const localnodeLedgerId = CAIPChainIdToLedgerId(HederaChainId.Devnet)

    expect(mainnetLedgerId).toBe(LedgerId.MAINNET)
    expect(testnetLedgerId).toBe(LedgerId.TESTNET)
    expect(previewnetLedgerId).toBe(LedgerId.PREVIEWNET)
    expect(localnodeLedgerId).toBe(LedgerId.LOCAL_NODE)
  })
})

describe(ledgerIdToCAIPChainId.name, () => {
  it('should convert a LedgerId object to a CAIP chain id', async () => {
    const mainnetChainId = ledgerIdToCAIPChainId(LedgerId.MAINNET)
    const testnetChainId = ledgerIdToCAIPChainId(LedgerId.TESTNET)
    const previewnetChainId = ledgerIdToCAIPChainId(LedgerId.PREVIEWNET)
    const localnodeChainId = ledgerIdToCAIPChainId(LedgerId.LOCAL_NODE)

    expect(mainnetChainId).toBe(HederaChainId.Mainnet)
    expect(testnetChainId).toBe(HederaChainId.Testnet)
    expect(previewnetChainId).toBe(HederaChainId.Previewnet)
    expect(localnodeChainId).toBe(HederaChainId.Devnet)
  })
})

describe(networkNameToCAIPChainId.name, () => {
  it('should convert a network name to a CAIP chain id', async () => {
    const mainnetChainId = networkNameToCAIPChainId('mainnet')
    const testnetChainId = networkNameToCAIPChainId('testnet')
    const previewnetChainId = networkNameToCAIPChainId('previewnet')
    const localnodeChainId = networkNameToCAIPChainId('devnet')

    expect(mainnetChainId).toBe(HederaChainId.Mainnet)
    expect(testnetChainId).toBe(HederaChainId.Testnet)
    expect(previewnetChainId).toBe(HederaChainId.Previewnet)
    expect(localnodeChainId).toBe(HederaChainId.Devnet)
  })
})

describe(networkNamespaces.name, () => {
  it('should create a `ProposalTypes.RequiredNamespaces` object for a given ledgerId', async () => {
    const methods = ['hedera_signMessage']
    const events = Object.values(HederaSessionEvent)
    const testnetNamespaces = networkNamespaces(LedgerId.TESTNET, methods, events)

    expect(testnetNamespaces.hedera).not.toBe(undefined)
    expect(testnetNamespaces.hedera.methods).toBe(methods)
    expect(testnetNamespaces.hedera.events).toBe(events)
    expect(testnetNamespaces.hedera.chains).toEqual([HederaChainId.Testnet])
  })
})
