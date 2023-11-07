import { type Transaction } from '@hashgraph/sdk'
import { EngineTypes } from '@walletconnect/types'
import { transactionToBase64String } from './utils'
import {
  HederaSignAndExecuteTransactionParams,
  HederaSignAndReturnTransactionParams,
  HederaSignMessageParams,
} from '../types'
import { HederaWalletConnectMethod } from './constants'

export function buildSignMessageParams(
  signerAccountId: string,
  messages: (Uint8Array | string)[],
): HederaSignMessageParams {
  return {
    signerAccountId,
    messages: messages.map((message) => Buffer.from(message).toString('base64')),
  }
}

function _buildTransactionParams(signerAccountId: string, transaction: Transaction) {
  return {
    signerAccountId,
    transaction: {
      bytes: transactionToBase64String(transaction),
    },
  }
}

export function buildSignAndExecuteTransactionParams(
  signerAccountId: string,
  transaction: Transaction,
): HederaSignAndExecuteTransactionParams {
  return _buildTransactionParams(signerAccountId, transaction)
}

export function buildSignAndReturnTransactionParams(
  signerAccountId: string,
  transaction: Transaction,
): HederaSignAndReturnTransactionParams {
  return _buildTransactionParams(signerAccountId, transaction)
}

type HederaSessionRequestOptions = Pick<
  EngineTypes.RequestParams,
  'chainId' | 'topic' | 'expiry'
>
export class HederaSessionRequest {
  public chainId: HederaSessionRequestOptions['chainId']
  public topic: HederaSessionRequestOptions['topic']
  public expiry: HederaSessionRequestOptions['expiry']

  constructor({ chainId, topic, expiry }: HederaSessionRequestOptions) {
    this.chainId = chainId
    this.topic = topic
    this.expiry = expiry
  }

  public static create(options: HederaSessionRequestOptions) {
    return new HederaSessionRequest(options)
  }

  public buildSignAndExecuteTransactionRequest(
    signerAccountId: string,
    transaction: Transaction,
  ) {
    return {
      ...this._buildFixedSessionRequestData(),
      request: {
        method: HederaWalletConnectMethod.signTransactionAndSend,
        params: buildSignAndExecuteTransactionParams(signerAccountId, transaction),
      },
    }
  }

  public buildSignAndReturnTransactionRequest(
    signerAccountId: string,
    transaction: Transaction,
  ) {
    return {
      ...this._buildFixedSessionRequestData(),
      request: {
        method: HederaWalletConnectMethod.signTransactionBody,
        params: buildSignAndReturnTransactionParams(signerAccountId, transaction),
      },
    }
  }

  public buildSignMessageRequest(signerAccountId: string, messages: (Uint8Array | string)[]) {
    return {
      ...this._buildFixedSessionRequestData(),
      request: {
        method: HederaWalletConnectMethod.signMessage,
        params: buildSignMessageParams(signerAccountId, messages),
      },
    }
  }

  private _buildFixedSessionRequestData() {
    return {
      chainId: this.chainId,
      topic: this.topic,
      expiry: this.expiry,
    }
  }
}
