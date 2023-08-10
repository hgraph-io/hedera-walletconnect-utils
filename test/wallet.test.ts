import { AccountId, Client, ClientNetworkName, PrivateKey } from '@hashgraph/sdk'
import { HederaWallet } from '../src'

jest.useFakeTimers()

describe(HederaWallet.name, () => {
  describe('init', () => {
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

  describe('constructor', () => {
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

  describe('signMessage', () => {
    // [private key type, private key, expected value]
    const testCases = [
      [
        'ECDSA',
        testPrivateKeyECDSA,
        '3wZ4lWhegOFJ+Wkzzeta1Zdg36GGIBzYTJ/dfzJrMS9dgiW47Q4fi/kbSaAz8Ti4stFHGnffwnIlrn20PGgbiA==',
      ],
      [
        'ED25519',
        testPrivateKeyED25519,
        'yU9PESjUTIHsust5Pm+KNWAAKKsHjzLBWEQhfzWVBQTDExdwc6YEnHbbBCbm2HZLtg+CuKD9uwnkrMm29XE5Dg==',
      ],
    ]
    test.each(testCases)(
      'should decode message bytes and sign with: %p',
      (_, privateKey, expected) => {
        const wallet = HederaWallet.init({
          network: 'testnet',
          accountId: 12345,
          privateKey,
        })
        const messageBytes = Buffer.from('Hello world').toString('base64')
        const result = wallet.signMessage(messageBytes)
        expect(result.signature).toEqual(expected)
      },
    )
  })
})
