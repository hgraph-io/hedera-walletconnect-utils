import { TopicCreateTransaction } from '@hashgraph/sdk'
import { HederaChainId, base64StringToSignatureMap, signatureMapToBase64 } from '../src'
import {
  prepareTestTransaction,
  projectId,
  testPrivateKeyECDSA,
  testUserAccountId,
  walletMetadata,
} from './_helpers'
import { Wallet } from '../src'

// TODO: remake it after fixes
describe('SignatureMap helpers', () => {
  let base64SignatureMap: string

  describe(signatureMapToBase64.name, () => {
    it('should encode SignatureMap to base64 string', async () => {
      const txn = prepareTestTransaction(new TopicCreateTransaction(), { freeze: true })
      const wallet = await Wallet.create(projectId, walletMetadata)
      const hederaWallet = wallet!.getHederaWallet(
        HederaChainId.Testnet,
        testUserAccountId,
        testPrivateKeyECDSA,
      )

      const signedTxn = await hederaWallet.signTransaction(txn)
      const signatureMap = signedTxn.getSignatures()
      console.log(signatureMap)
      base64SignatureMap = signatureMapToBase64(signatureMap)

      expect(typeof base64SignatureMap).toBe('string')
      expect(base64SignatureMap).toBe(
        'eyIwLjAuMyI6eyIzMDJkMzAwNzA2MDUyYjgxMDQwMDBhMDMyMjAwMDI3ODI3OWRmMjFhZTNjZDMwNjEwNjI3YjFlNDIzZWJiNzQwNWM1NGI4MDM5YWY1NTJjNGI0NThmYjYzYWE4ZDMzIjp7IjAiOjE0MywiMSI6MjUxLCIyIjoyNCwiMyI6MTQwLCI0IjoyNTEsIjUiOjEwNywiNiI6MTQsIjciOjY3LCI4Ijo5MiwiOSI6MTI0LCIxMCI6MTM1LCIxMSI6NjMsIjEyIjoxMDksIjEzIjoyNCwiMTQiOjEsIjE1IjowLCIxNiI6MTgsIjE3IjoyMjQsIjE4IjoyMiwiMTkiOjI4LCIyMCI6MzcsIjIxIjo4MywiMjIiOjI5LCIyMyI6MTkxLCIyNCI6MjEzLCIyNSI6MTc2LCIyNiI6MjA4LCIyNyI6MTcwLCIyOCI6MTIsIjI5IjoxMzMsIjMwIjoyMjcsIjMxIjo3NiwiMzIiOjE3NywiMzMiOjEzNSwiMzQiOjIwLCIzNSI6NzksIjM2IjoxODYsIjM3IjoxNTAsIjM4IjoxLCIzOSI6MjEzLCI0MCI6ODQsIjQxIjoxMTMsIjQyIjoyNTMsIjQzIjo1OCwiNDQiOjI0OSwiNDUiOjE4MCwiNDYiOjIxNSwiNDciOjg1LCI0OCI6MTg4LCI0OSI6MTU3LCI1MCI6MTk5LCI1MSI6MjIwLCI1MiI6MTM1LCI1MyI6MjMxLCI1NCI6MjEzLCI1NSI6MTA4LCI1NiI6MTg0LCI1NyI6MjM5LCI1OCI6MTUyLCI1OSI6MjM2LCI2MCI6MTI1LCI2MSI6MjI2LCI2MiI6MjQ2LCI2MyI6MjUyfX19',
      )
    })
  })

  describe(base64StringToSignatureMap.name, () => {
    it('should decode base64 string to SignatureMap', async () => {
      const signatureMap = base64StringToSignatureMap(base64SignatureMap)
      console.log(JSON.stringify(signatureMap, null, 2))
      // expect(signatureMap).toBe(???)
    })
  })
})
