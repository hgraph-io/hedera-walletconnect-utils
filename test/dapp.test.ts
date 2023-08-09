import { RequestType, TopicCreateTransaction } from '@hashgraph/sdk'
import {
  buildSignAndExecuteTransactionParams,
  buildSignAndReturnTransactionParams,
  buildSignMessageParams,
} from '../src'
import { prepareTestTransaction } from './_helpers'

describe(buildSignMessageParams.name, () => {
  it('should build params with base64 encoded message', () => {
    const msg = 'Test me'
    const result = buildSignMessageParams(msg)
    const expected = { message: 'VGVzdCBtZQ==' }

    expect(result).toEqual(expected)
  })
})

describe(buildSignAndExecuteTransactionParams.name, () => {
  it('should build transaction params with type and bytes', () => {
    const type = RequestType.ConsensusCreateTopic
    const transaction = prepareTestTransaction(new TopicCreateTransaction())
    const result = buildSignAndExecuteTransactionParams(type, transaction)

    expect(result.transaction.type).toBe(type.toString())
    expect(typeof result.transaction.bytes).toBe('string')
    // TODO: find a good way to verify results. Base64 string changes slightly every time.
  })
})

describe(buildSignAndReturnTransactionParams.name, () => {
  it('should build transaction params with type and bytes', () => {
    const type = RequestType.ConsensusCreateTopic
    const transaction = prepareTestTransaction(new TopicCreateTransaction())
    const result = buildSignAndReturnTransactionParams(type, transaction)

    expect(result.transaction.type).toBe(type.toString())
    expect(typeof result.transaction.bytes).toBe('string')
    // TODO: find a good way to verify results. Base64 string changes slightly every time.
  })
})
