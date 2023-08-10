import { AccountId, Client, ClientNetworkName, PrivateKey } from '@hashgraph/sdk'
import { HederaWallet } from '../src'

jest.useFakeTimers()

describe(HederaWallet.name, () => {
  describe('Init method', () => {
    // [networkName, accountId]
    const testCases: [ClientNetworkName, string | number][] = [
      ['mainnet', 12345],
      ['previewnet', 12345],
      ['testnet', 12345],
      ['mainnet', '0.0.12345'],
      ['previewnet', '0.0.12345'],
      ['testnet', '0.0.12345'],
    ]
    test.each(testCases)(
      'it should initialize with a %p client and accountId %p',
      (network, accountId) => {
        const wallet = HederaWallet.init({
          accountId,
          privateKey: PrivateKey.generateED25519().toStringDer(),
          network,
        })
        expect(wallet).toBeInstanceOf(HederaWallet)
        expect(wallet.accountId.toString()).toBe('0.0.12345')
        expect(wallet.client).toBeInstanceOf(Client)
      },
    )
  })

  describe('Constructor', () => {
    // [AccountId, PrivateKey]
    const testCases: [AccountId, PrivateKey][] = [
      [new AccountId(12345), PrivateKey.generateECDSA()],
      [
        AccountId.fromBytes(new Uint8Array([8, 0, 16, 0, 24, 185, 96])), // Array obtained from accountId.toBytes()
        PrivateKey.generateED25519(),
      ],
    ]
    test.each(testCases)(
      'it should construct with various AccountId, PrivateKey values',
      (accountId, privateKey) => {
        const wallet = new HederaWallet({ accountId, privateKey, network: 'testnet' })
        expect(wallet).toBeInstanceOf(HederaWallet)
        expect(wallet.accountId.toString()).toBe('0.0.12345')
        expect(wallet.client).toBeInstanceOf(Client)
      },
    )
  })
})
