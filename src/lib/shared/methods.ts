export const HEDERA_JSON_RPC_PREFIX = 'hedera_'

export enum HederaJsonRpcMethod {
  GetNodeAddresses = 'getNodeAddresses',
  SendTransactionOnly = 'sendTransactionOnly',
  SignMessage = 'signMessage',
  SignQueryAndSend = 'signQueryAndSend',
  SignTransactionAndSend = 'signTransactionAndSend',
  SignTransactionBody = 'signTransactionBody',
}
