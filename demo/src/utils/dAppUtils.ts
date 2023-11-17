import { Buffer } from 'buffer';
import { AccountId, Hbar, TransactionId, TransferTransaction } from "@hashgraph/sdk";
import { SignExecuteTransactionReqParams } from "@src/types/walletConnectSession";
import { SignClient } from "@walletconnect/sign-client/dist/types/client";

export type signExecuteTransactionOptions = {
  payerAccountId: string;
  recipientAccountId: string;
  hbarCount: number;
  immidiateResponse?: boolean;
}

export async function signExecuteTransaction(signClient: SignClient, {
  payerAccountId,
  recipientAccountId,
  hbarCount,
  immidiateResponse = false,
}: signExecuteTransactionOptions) {
  console.log('sign-execute-transaction', immidiateResponse ? '(immidiate)' : '');

  try {
    // transfer hbarCount to absolute number, because it can't be negative
    hbarCount = Math.abs(hbarCount);

    // Create a transaction to transfer hbarCount
    const transaction = new TransferTransaction()
      .setNodeAccountIds([new AccountId(3)]) // Useless here I guess.
      .setTransactionId(TransactionId.generate(payerAccountId))
      .addHbarTransfer(payerAccountId, new Hbar(-hbarCount))
      .addHbarTransfer(recipientAccountId, new Hbar(hbarCount))
      .freeze() // Freeze this transaction from further modification to prepare for signing or serialization. 
      .toBytes()

    const params: SignExecuteTransactionReqParams = {
        bodyBytes: Buffer.from(transaction).toString('base64'),
        sigMap: undefined,
        immidiateResponse,
    }

    const walletConnectSession = signClient?.session?.getAll?.()?.[signClient?.session?.getAll?.()?.length - 1];
    if (!walletConnectSession) {
      throw Error('There is no walletConnect session');
    };

    const response = await signClient.request({
      topic: walletConnectSession.topic,
      chainId: 'hedera:testnet',
      request: {
          method: 'hedera_signAndExecuteTransaction',
          params,
      },
    });

    return response;
  } catch (err) {
    console.log(err);
    return err;
  }
}