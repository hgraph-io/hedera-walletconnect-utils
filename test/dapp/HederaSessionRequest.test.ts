import { TopicCreateTransaction, TopicDeleteTransaction } from '@hashgraph/sdk'
import { HederaJsonRpcMethod, HederaSessionRequest, networkNameToCAIPChainId } from '../../src'
import { prepareTestTransaction, useJsonFixture } from '../_helpers'

const CHAIN_ID = networkNameToCAIPChainId('testnet')
const TOPIC = 'abcdef123456'

describe(HederaSessionRequest.name, () => {
  describe('create', () => {
    it('should init with just topic and chainId', () => {
      const result = HederaSessionRequest.create({ chainId: CHAIN_ID, topic: TOPIC })
      const expected = { chainId: CHAIN_ID, topic: TOPIC, expiry: undefined }

      expect(result).toEqual(expected)
    })

    it('should init with optional expiry value', () => {
      const result = HederaSessionRequest.create({
        chainId: CHAIN_ID,
        topic: TOPIC,
        expiry: 1000,
      })
      const expected = { chainId: CHAIN_ID, topic: TOPIC, expiry: 1000 }

      expect(result).toEqual(expected)
    })
  })

  describe('buildSignAndExecuteTransactionRequest', () => {
    it(`should build request with ${HederaJsonRpcMethod.SignAndExecuteTransaction} params`, () => {
      const transaction = prepareTestTransaction(new TopicCreateTransaction())

      const result = HederaSessionRequest.create({
        chainId: CHAIN_ID,
        topic: TOPIC,
      }).buildSignAndExecuteTransactionRequest('0.0.1234', transaction)

      const expected = {
        chainId: CHAIN_ID,
        topic: TOPIC,
        expiry: undefined,
        request: {
          method: HederaJsonRpcMethod.SignAndExecuteTransaction,
          params: useJsonFixture('buildSignAndExecuteTransactionParamsResult'),
        },
      }

      expect(result).toEqual(expected)
    })
  })

  // TODO: rename this helper later maybe?
  describe('buildSignAndReturnTransactionRequest', () => {
    it(`should build request with ${HederaJsonRpcMethod.SignTransaction} params`, () => {
      const transaction = prepareTestTransaction(new TopicDeleteTransaction())

      const result = HederaSessionRequest.create({
        chainId: CHAIN_ID,
        topic: TOPIC,
      }).buildSignAndReturnTransactionRequest('0.0.1234', transaction)

      const expected = {
        chainId: CHAIN_ID,
        topic: TOPIC,
        expiry: undefined,
        request: {
          method: HederaJsonRpcMethod.SignTransaction,
          params: useJsonFixture('buildSignAndReturnTransactionParamsResult'),
        },
      }

      expect(result).toEqual(expected)
    })
  })

  describe('buildSignMessageRequest', () => {
    it(`should build request with ${HederaJsonRpcMethod.SignMessage} params`, () => {
      const result = HederaSessionRequest.create({
        chainId: CHAIN_ID,
        topic: TOPIC,
      }).buildSignMessageRequest('0.0.1234', ['Test me'])

      const expected = {
        chainId: CHAIN_ID,
        topic: TOPIC,
        expiry: undefined,
        request: {
          method: HederaJsonRpcMethod.SignMessage,
          params: useJsonFixture('buildSignMessageParamsResult'),
        },
      }

      expect(result).toEqual(expected)
    })
  })
})
