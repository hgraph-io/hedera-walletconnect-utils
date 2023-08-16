# Hedera WalletConnect Utils

This package is a wrapper library for the [`@hashgraph/sdk`](https://www.npmjs.com/package/@hashgraph/sdk) library. It provides a means of integrating Hedera with WalletConnect with functions to facilitate implementing the [Hedera JSON-RPC schema](https://specs.walletconnect.com/2.0/blockchain-rpc/everscale-rpc). To see how to set up WalletConnect in dApps/wallets, view their [documentation](https://docs.walletconnect.com/2.0/). Once the dApp and wallet are configured to manage WalletConnect sessions, you can use this module's functions to easily create and handle sessions requests for Hedera.


## DApp Usage

1. **Initialization of WalletConnect SignClient**: Start by setting up a WalletConnect [`SignClient`](https://docs.walletconnect.com/2.0/api/sign/dapp-usage). This is your primary interface for establishing and managing sessions between your dApp and the user's wallet.

```js
import SignClient from '@walletconnect/sign-client'

const signClient = await SignClient.init({ ...signClientProps })
// Ensure other initialization steps are followed as per the WalletConnect documentation.
```

2. **Constructing a Hedera Transaction**: Use the `@hashgraph/sdk` to build your desired Hedera transaction. It's important to manually set a `TransactionId` as it ensures traceability and potential reconciliation of transactions. [See the SDK documentation for more transaction types](https://docs.hedera.com/hedera/sdks-and-apis/sdks/transactions).

```js
import { AccountId, TransactionId, TopicMessageSubmitTransaction } from '@hashgraph/sdk'

const payerAccountId = new AccountId(userAccountId)
const transactionId = TransactionId.generate(payerAccountId)

const transaction = new TopicMessageSubmitTransaction()
  .setTopicId(topicId)
  .setMessage('Hello world')
  .setTransactionId(transactionId)
```

3. **Building the Session Request Payload**: The `@hgraph.io/hedera-walletconnect-utils` library provides a seamless way to prepare the session request payload. Ensure that you set the `RequestType` accurately to match the type of Hedera transaction you've constructed.

```js
import {..., RequestType } from '@hashgraph/sdk'
import { HederaSessionRequest } from '@hgraph.io/hedera-walletconnect-utils'

const payload = HederaSessionRequest.create({
  chainId: 'hedera:testnet',
  topic: 'abcdef123456',
}).buildSignAndExecuteTransactionRequest(RequestType.ConsensusSubmitMessage, transaction)
```

4. **Sending the Transaction to the Wallet**: With the payload prepared, utilize the WalletConnect `signClient` to dispatch the transaction details to the user's wallet for approval. This step prompts users on their end to either sign or reject the transaction.

```js
signClient.request(payload).then((result) => {
  console.log(result)
  return result
})
```

By following these steps, developers can ensure a comprehensive and user-friendly integration of Hedera with WalletConnect in their dApps. Always refer to the linked documentation for in-depth details and best practices.

## Wallet Usage

1. **Initialize the WalletConnect AuthClient**: To begin, wallets should first instantiate the WalletConnect [`AuthClient`](https://docs.walletconnect.com/2.0/api/auth/wallet-usage) to manage authentication requests.

```js
import AuthClient from '@walletconnect/auth-client'

const authClient = await AuthClient.init({ ...authClientProps })
// Perform other initialization steps as needed. Refer to WalletConnect documentation.
```

2. **Listen for Session Requests**: Wallets should actively listen for incoming session requests that are initiated by dApps.

```js
authClient.on('auth_request', async ({ id, params }) => {
  // Handle the authentication request here.
  // This could include displaying a UI prompt to the user.
});
```

Working through signClient and authCient overlap still