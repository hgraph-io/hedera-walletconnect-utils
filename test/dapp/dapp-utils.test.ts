import { TopicCreateTransaction, TopicDeleteTransaction } from '@hashgraph/sdk'
import {
  buildSignAndExecuteTransactionParams,
  buildSignAndReturnTransactionParams,
  buildSignMessageParams,
} from '../../src'
import { prepareTestTransaction, useJsonFixture } from '../_helpers'

describe(buildSignMessageParams.name, () => {
  it('should build params with base64 encoded message', () => {
    const msg = 'Test me'
    const result = buildSignMessageParams('0.0.1234', [msg])
    const expected = useJsonFixture('buildSignMessageParamsResult')

    expect(result).toEqual(expected)
  })
})

describe(buildSignAndExecuteTransactionParams.name, () => {
  it('should build transaction params with type and bytes', () => {
    const transaction = prepareTestTransaction(new TopicCreateTransaction())

    const result = buildSignAndExecuteTransactionParams('0.0.1234', transaction)
    const expected = useJsonFixture('buildSignAndExecuteTransactionParamsResult')

    expect(result).toEqual(expected)
  })
})

describe(buildSignAndReturnTransactionParams.name, () => {
  it('should build transaction params with type and bytes', () => {
    const transaction = prepareTestTransaction(new TopicDeleteTransaction())

    const result = buildSignAndReturnTransactionParams('0.0.1234', transaction)
    const expected = useJsonFixture('buildSignAndReturnTransactionParamsResult')

    expect(result).toEqual(expected)
  })
})
