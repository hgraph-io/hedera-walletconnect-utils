import { RequestType, type Transaction } from '@hashgraph/sdk'
import { transactionToBase64String } from './utils'
import {
  HederaSignAndExecuteTransactionParams,
  HederaSignAndReturnTransactionParams,
  HederaSignMessageParams,
} from '../types'

export function buildSignMessageParams(message: string): HederaSignMessageParams {
  return {
    message: Buffer.from(message).toString('base64'),
  }
}

function _buildTransactionParams(type: RequestType, transaction: Transaction) {
  return {
    transaction: {
      type: type.toString(),
      bytes: transactionToBase64String(transaction),
    },
  }
}

export function buildSignAndExecuteTransactionParams(
  type: RequestType,
  transaction: Transaction,
): HederaSignAndExecuteTransactionParams {
  return _buildTransactionParams(type, transaction)
}

export function buildSignAndReturnTransactionParams(
  type: RequestType,
  transaction: Transaction,
): HederaSignAndReturnTransactionParams {
  return _buildTransactionParams(type, transaction)
}
