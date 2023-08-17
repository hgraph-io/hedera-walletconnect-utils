# Hedera WalletConnect Utils

This package is a wrapper library for the [`@hashgraph/sdk`](https://www.npmjs.com/package/@hashgraph/sdk) library. It provides a means of integrating Hedera with WalletConnect with functions to facilitate implementing the [Hedera JSON-RPC schema](https://specs.walletconnect.com/2.0/blockchain-rpc/everscale-rpc). To see how to set up WalletConnect in dApps/wallets, view their [documentation](https://docs.walletconnect.com/2.0/). Once the dApp and wallet are configured to manage WalletConnect sessions, you can use this module's functions to easily create and handle sessions requests for Hedera.


## DApp Usage

1. **Initialization of WalletConnect SignClient**: Start by setting up a WalletConnect [`SignClient`](https://docs.walletconnect.com/2.0/api/sign/dapp-usage). This is your primary interface for establishing and managing sessions between your dApp and the user's wallet.

```js
import SignClient from '@walletconnect/sign-client'

const signClient = await SignClient.init({ ...signClientProps })
// Ensure other initialization steps are followed as per the WalletConnect documentation.
```

2. **Constructing a Hedera Transaction**: Use the `@hashgraph/sdk` to build your desired Hedera transaction. It's important and required to manually set a `TransactionId` as it ensures traceability and potential reconciliation of transactions. [See the SDK documentation for more transaction types](https://docs.hedera.com/hedera/sdks-and-apis/sdks/transactions).

```js
import { AccountId, TransactionId, TopicMessageSubmitTransaction } from '@hashgraph/sdk'

const payerAccountId = new AccountId(userAccountId)
const transactionId = TransactionId.generate(payerAccountId)

const transaction = new TopicMessageSubmitTransaction()
  .setTopicId(topicId)
  .setMessage('Hello world')
  .setTransactionId(transactionId)
```

3. **Building the Session Request Payload**: The `@hashgraph/wallectconnect` library provides a seamless way to prepare the session request payload. Ensure that you set the `RequestType` accurately to match the type of Hedera transaction you've constructed.

```js
import {..., RequestType } from '@hashgraph/sdk'
import { HederaSessionRequest } from '@hashgraph/wallectconnect'

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

### 1. Setup and Installation

First, make sure you've installed the necessary npm packages:

```bash
npm install @walletconnect/sign-client @hashgraph/sdk @hashgraph/wallectconnect
```


### 2. Initialize WalletConnect SignClient

You'll need your WalletConnect Project ID for this step. If you haven't already, obtain a Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/app).

```javascript
import SignClient from '@walletconnect/sign-client';

const signClient = await SignClient.init({
  projectId: 'YOUR_PROJECT_ID',
  metadata: {
    name: 'Your Wallet Name',
    description: 'Description for your wallet',
    url: 'https://your-wallet-url.com',
    icons: ['https://your-wallet-url.com/icon.png'],
  }
});
```

### 3. Event Listeners

WalletConnect emits various events during a session. Listen to these events to synchronize the state of your application:

```javascript
// Handle pairing proposals
signClient.on('session_proposal', event => {
  // Display session proposal to the user and decide to approve or reject
});

// Handle session requests, like signing transactions or messages
signClient.on('session_request', event => {
  // Process the session request
});

// Handle session deletions
signClient.on('session_delete', event => {
  // React to session termination
});
```

For a complete list of events and their structure, refer to the provided WalletConnect tutorial. [WalletConnect Usage](https://docs.walletconnect.com/2.0/api/auth/wallet-usage)

### 4. Pairing with dApps

Pairing establishes a connection between the wallet and a dapp. Once paired, the dApp can send session requests to the wallet.

#### a. Pairing via URI

If a dapp shares a URI for pairing:

```javascript
await signClient.core.pairing.pair({ uri: 'RECEIVED_URI' });
```

Upon successful pairing, the `session_proposal` event will be triggered.

#### b. Pairing via QR Codes

For a better user experience, dApps often share QR codes that wallets can scan to establish a pairing. Use a QR code scanning library to scan and obtain the URI, then proceed with pairing:

```javascript
const scannedUri = '...'; // URI obtained from scanning the QR code
await signClient.core.pairing.pair({ uri: scannedUri });
```

### 5. Handling Session Proposals

Upon receiving a `session_proposal` event, display the proposal details to the user. Allow them to approve or reject the session:

```javascript
// Approving a session proposal
const { topic, acknowledged } = await signClient.approve({
  id: proposalId, // From the session_proposal event
  namespaces: {
    hedera: {
      accounts: ['hedera:testnet:YOUR_HEDERA_ACCOUNT_ID'],
      methods: ['personal_sign', 'eth_sendTransaction'],
      events: ['accountsChanged']
    }
  }
});

// Rejecting a session proposal
await signClient.reject({
  id: proposalId,
  reason: {
    code: 1,
    message: 'User rejected the proposal'
  }
});
```

### 6. Handling Session Requests

Upon receiving a `session_request` event, process the request. For instance, if the dApp requests a transaction to be signed:

```javascript
// Using the @hgraph.io/hedera-walletconnect-utils library
import { base64StringToTransaction, HederaWallet } from 'hashgraph/walletconnect';

const transaction = base64StringToTransaction(event.params.request.params);
const hederaWallet = await HederaWallet.init({
  accountId: 'YOUR_HEDERA_ACCOUNT_ID',
  privateKey: 'YOUR_HEDERA_PRIVATE_KEY',
  network: 'testnet'
});
const response = await hederaWallet.signAndExecuteTransaction(transaction);
```

Return the signed transaction to the dApp:

```javascript
await signClient.send({ id: event.id, result: response });
```

### 7. Ending a Session

Sessions can be deleted by either the dapp or the wallet. When the `session_delete` event is triggered, update your application's state to reflect the end of the session:

```javascript
signClient.on('session_delete', event => {
  // Update the UI to show the session has ended
});
```

Remember to always handle errors gracefully, informing users about any issues or required actions. With the above steps, your wallet should be fully integrated with the Hedera WalletConnect Utils and ready to interact with dApps over WalletConnect.
