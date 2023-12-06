// Ordered alphabetically for ease of use and readability in other locations
export enum HederaJsonRpcMethod {
  GetNodeAddresses = 'hedera_getNodeAddresses', // 1
  ExecuteTransaction = 'hedera_executeTransaction', // 2
  SignMessage = 'hedera_signMessage', // 3
  SignQueryAndSend = 'hedera_signQueryAndSend', // 4
  SignAndExecuteTransaction = 'hedera_signAndExecuteTransaction', // 5
  SignTransaction = 'hedera_signTransaction', // 6
}
