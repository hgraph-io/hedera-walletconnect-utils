import {
  Signer,
  AccountBalance,
  AccountId,
  AccountInfo,
  Executable,
  Key,
  LedgerId,
  SignerSignature,
  Transaction,
  TransactionRecord,
} from '@hashgraph/sdk'
import type { ISignClient } from '@walletconnect/types'

import { ledgerIdToCAIPChainId } from '../shared'

export class DAppSigner implements Signer {
  constructor(
    private readonly accountId: AccountId,
    private readonly signClient: ISignClient,
    public readonly topic: string,
    private readonly ledgerId: LedgerId = LedgerId.MAINNET,
  ) {}

  request<T>(request: { method: string; params: any }): Promise<T> {
    return this.signClient.request<T>({
      topic: this.topic,
      request,
      chainId: ledgerIdToCAIPChainId(this.ledgerId),
    })
  }

  getAccountId(): AccountId {
    return this.accountId
  }

  getAccountKey(): Key {
    throw new Error('Method not implemented.')
  }

  getLedgerId(): LedgerId {
    return this.ledgerId
  }

  getNetwork(): { [key: string]: string | AccountId } {
    throw new Error('Method not implemented.')
  }

  getMirrorNetwork(): string[] {
    throw new Error('Method not implemented.')
  }

  getAccountBalance(): Promise<AccountBalance> {
    throw new Error('Method not implemented.')
  }

  getAccountInfo(): Promise<AccountInfo> {
    throw new Error('Method not implemented.')
  }

  getAccountRecords(): Promise<TransactionRecord[]> {
    throw new Error('Method not implemented.')
  }

  async sign(
    data: Uint8Array[],
    signOptions?: Record<string, any>,
  ): Promise<SignerSignature[]> {
    throw new Error('Method not implemented.')
  }

  async checkTransaction<T extends Transaction>(transaction: T): Promise<T> {
    throw new Error('Method not implemented.')
  }

  async populateTransaction<T extends Transaction>(transaction: T): Promise<T> {
    throw new Error('Method not implemented.')
  }

  async call<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>,
  ): Promise<OutputT> {
    throw new Error('Method not implemented.')
  }
}
