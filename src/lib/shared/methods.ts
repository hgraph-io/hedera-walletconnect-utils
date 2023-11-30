export enum JsonRPCMethod {
  GetNodeAddresses = 'getNodeAddresses',
  SendTransactionOnly = 'sendTransactionOnly',
  SignMessage = 'signMessage',
  SignQueryAndSend = 'signQueryAndSend',
  SignTransactionAndSend = 'signTransactionAndSend',
  SignTransactionBody = 'signTransactionBody',
}

export enum HederaJsonRpcMethod {
  GetNodeAddresses = 'hedera_getNodeAddresses',
  SendTransactionOnly = 'hedera_sendTransactionOnly',
  SignMessage = 'hedera_signMessage',
  SignQueryAndSend = 'hedera_signQueryAndSend',
  SignTransactionAndSend = 'hedera_signTransactionAndSend',
  SignTransactionBody = 'hedera_signTransactionBody',
}

export enum EthereumJsonRpcMethod {
  // GetNodeAddresses = 'hedera_getNodeAddresses', // ??
  SendRawTransaction = 'eth_sendRawTransaction', // hedera_sendTransactionOnly
  Sign = 'eth_sign', // hedera_signMessage
  // SignQueryAndSend = 'hedera_signQueryAndSend', // ??
  SendTransaction = 'eth_sendTransaction', // hedera_signTransactionAndSend
  SignTransaction = 'eth_signTransaction', // hedera_signTransactionBody
}