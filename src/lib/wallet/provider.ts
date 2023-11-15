import {
  Client,
  AccountBalanceQuery,
  AccountInfoQuery,
  AccountRecordsQuery,
  TransactionReceiptQuery,
  type AccountId,
  type Executable,
  type Provider as HederaWalletProvider,
  type TransactionId,
  type TransactionResponse,
  type TransactionReceipt,
} from '@hashgraph/sdk'

export default class Provider implements HederaWalletProvider {
  constructor(private client: Client) {}

  static fromClient(client: Client) {
    return new Provider(client)
  }

  getLedgerId() {
    return this.client.ledgerId
  }

  getNetwork() {
    return this.client.network
  }

  getMirrorNetwork() {
    return this.client.mirrorNetwork
  }

  getAccountBalance(accountId: AccountId | string) {
    return new AccountBalanceQuery().setAccountId(accountId).execute(this.client)
  }

  getAccountInfo(accountId: AccountId | string) {
    return new AccountInfoQuery().setAccountId(accountId).execute(this.client)
  }

  getAccountRecords(accountId: string | AccountId) {
    return new AccountRecordsQuery().setAccountId(accountId).execute(this.client)
  }

  getTransactionReceipt(transactionId: TransactionId | string) {
    return new TransactionReceiptQuery().setTransactionId(transactionId).execute(this.client)
  }

  waitForReceipt(response: TransactionResponse): Promise<TransactionReceipt> {
    return new TransactionReceiptQuery()
      .setNodeAccountIds([response.nodeId])
      .setTransactionId(response.transactionId)
      .execute(this.client)
  }

  call<Request, Response, Output>(
    request: Executable<Request, Response, Output>,
  ): Promise<Output> {
    return request.execute(this.client)
  }
}
