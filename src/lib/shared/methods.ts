/**
 * Enum representing different JSON-RPC methods related to Hedera.
 * The methods are ordered alphabetically for ease of use and readability.
 */
export enum HederaJsonRpcMethod {
  GetNodeAddresses = 'hedera_getNodeAddresses', // 1
  ExecuteTransaction = 'hedera_executeTransaction', // 2
  SignMessage = 'hedera_signMessage', // 3
  SignQueryAndSend = 'hedera_signQueryAndSend', // 4
  SignAndExecuteTransaction = 'hedera_signAndExecuteTransaction', // 5
  SignTransaction = 'hedera_signTransaction', // 6
}
