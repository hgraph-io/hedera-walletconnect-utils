# Hedera WalletConnect Utils

This package is a wrapper library for the [`@hashgraph/sdk`](https://www.npmjs.com/package/@hashgraph/sdk) library. It provides a means of integrating Hedera with WalletConnect with functions to facilitate implementing the [Hedera JSON-RPC schema](https://specs.walletconnect.com/2.0/blockchain-rpc/everscale-rpc). To see how to set up WalletConnect in dApps/wallets, view their [documentation](https://docs.walletconnect.com/2.0/). Once the dApp and wallet are configured to manage WalletConnect sessions, you can use this module's functions to easily create and handle sessions requests for Hedera.

## DApp Usage

1. On the dApp side, we must first instantiate a WalletConnect [`SignClient`](https://docs.walletconnect.com/2.0/api/sign/dapp-usage) and establish a session with a wallet.

```js
import SignClient from '@walletconnect/sign-client'

const signClient = await SignClient.init({ ...signClientProps })
// Perfrom other initialization steps. See WalletConnect docs.
```

2. Then we can build a transaction with the `@hashgraph/sdk`, making sure to set a `TransactionId` manually.

```js
import { AccountId, TransactionId, TopicMessageSubmitTransaction } from '@hashgraph/sdk'

const payerAccountId = new AccountId(userAccountId)
const transactionId = TransactionId.generate(payerAccountId)

const transaction = new TopicMessageSubmitTransaction()
  .setTopicId(topicId)
  .setMessage('Hello world')
  .setTransactionId(transactionId)
```

3. Next, we can use `@hgraph.io/hedera-walletconnect-utils` to build the session request payload. You must use carefully set the `RequestType` with the correct `Transaction` type.

```js
import {..., RequestType } from '@hashgraph/sdk'
import { HederaSessionRequest } from '@hgraph.io/hedera-walletconnect-utils'

const payload = HederaSessionRequest.create({
  chainId: 'hedera:testnet',
  topic: 'abcdef123456',
}).buildSignAndExecuteTransactionRequest(RequestType.ConsensusSubmitMessage, transaction)
```

4. Finally, we can use the WalletConnect `signClient` to pass the payload to the wallet.

```js
signClient.request(payload).then((result) => {
  console.log(result)
  return result
})
```

## Wallet Usage
