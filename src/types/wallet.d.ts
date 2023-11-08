import { Client, Transaction, PrivateKey, AccountId, ClientNetworkName } from '@hashgraph/sdk'

export type HederaWalletOptions = {
  accountId: AccountId
  privateKey: PrivateKey
  network: ClientNetworkName
}

export type InitOptions = {
  accountId: ConstructorParameters<typeof AccountId>[0] | string
  privateKey: string
  network: ClientNetworkName
}
