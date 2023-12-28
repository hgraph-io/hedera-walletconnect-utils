import { Wallet as HederaWallet, LedgerId } from '@hashgraph/sdk'
import { HederaChainId, Wallet } from '../../src'
import {
  defaultAccountNumber,
  projectId,
  testPrivateKeyECDSA,
  walletMetadata,
} from '../_helpers'

describe(Wallet.name, () => {
  describe('create', () => {
    let wallet: Wallet

    beforeAll(async () => {
      wallet = await Wallet.create(projectId, walletMetadata)
    })

    it('should create Wallet instance with a projectId and walletMetadata', async () => {
      expect(wallet).toBeInstanceOf(Wallet)
      expect(wallet.metadata).toBe(walletMetadata)
      expect(wallet.core.projectId).toBe(projectId)
    })

    describe('getHederaWallet', () => {
      // [HederaChainId, accountId, LedgerId]
      const testCases: [HederaChainId, string | number, LedgerId][] = [
        [HederaChainId.Mainnet, defaultAccountNumber, LedgerId.MAINNET],
        [HederaChainId.Previewnet, defaultAccountNumber, LedgerId.PREVIEWNET],
        [HederaChainId.Testnet, defaultAccountNumber, LedgerId.TESTNET],
        [HederaChainId.Mainnet, `0.0.${defaultAccountNumber}`, LedgerId.MAINNET],
        [HederaChainId.Previewnet, `0.0.${defaultAccountNumber}`, LedgerId.PREVIEWNET],
        [HederaChainId.Testnet, `0.0.${defaultAccountNumber}`, LedgerId.TESTNET],
      ]
      test.each(testCases)(
        'it should initialize HederaWallet with %p chainId and %p accountId',
        async (chainId, accountId, ledgerId) => {
          const hederaWallet = wallet!.getHederaWallet(
            chainId,
            accountId.toString(),
            testPrivateKeyECDSA,
          )

          expect(wallet).toBeInstanceOf(Wallet)
          expect(hederaWallet).toBeInstanceOf(HederaWallet)
          expect(hederaWallet.accountId.toString()).toBe(`0.0.${defaultAccountNumber}`)
          expect(hederaWallet.provider!.getLedgerId()).toBe(ledgerId)
        },
      )
    })
  })
})
