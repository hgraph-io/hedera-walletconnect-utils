import { Buffer } from 'buffer';

import {
  Client,
  Transaction,
  PrivateKey,
} from '@hashgraph/sdk'
import { SessionParams, SessionCredentials } from '@src/types/walletConnectSession';
import { ProtoSignedTransaction } from '@hashgraph/sdk/lib/schedule/ScheduleSignTransaction';

export async function signAndExecuteTransaction(params: ProtoSignedTransaction, credentials: SessionCredentials) {
    const {bodyBytes, sigMap} = params;

    // TODO: don't sign if has SigMap
    if (sigMap) {}
    
    if (!bodyBytes) {
      return 'transaction bodyBytes not found in request.params.bodyBytes';
    }

    if (!credentials.hederaAccountId) {
      return 'Hedera AccountId was not found!';
    }

    if (!credentials.hederaPrivateKey) {
      return 'Hedera PrivateKey was not found!';
    }
    
    try {
        // convert `requestParamsMessage` by using a method like hexToUtf8
        const transaction = Transaction.fromBytes(bodyBytes)
        const client = Client.forTestnet()

        // ANOTHER WAY OF SIGNING TRANSACTION
        // Set the operator with the account ID and private key (operator)
        // The operator is the account that will, by default, pay the transaction fee for transactions and queries built with this client.
        // client.setOperator(credentials.hederaAccountId, PrivateKey.fromString(credentials.hederaPrivateKey));
        // const signedTransaction = await transaction.signWithOperator(client)

        const signedTransaction = await transaction.sign(PrivateKey.fromString(credentials.hederaPrivateKey))
        const transactionResponse = await signedTransaction.execute(client)
        // const transactionId = transactionResponse.transactionId;
    
        const transactionReceipt = await transactionResponse.getReceipt(client)
        return transactionReceipt.status._code;
      } catch (err) {
        console.log(err);
        // @ts-ignore
        return err?.status?._code || 'Unexpected error';
      }
}

export async function parseSessionRequest(params: SessionParams, sessionCredentials: SessionCredentials) {
  const requestMethod = params.request.method;

  switch (requestMethod) {
    case 'hedera_signAndExecuteTransaction': {
      let requestParams = params.request.params;

      const parsedRequestParams: ProtoSignedTransaction = {
        bodyBytes: Buffer.from(requestParams?.bodyBytes, 'base64'),
        sigMap: requestParams?.sigMap,
      }

      return signAndExecuteTransaction(parsedRequestParams, sessionCredentials);
    }
  }

  return 'Something went wrong...';
}