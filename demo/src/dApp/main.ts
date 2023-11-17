/*
 * https://docs.walletconnect.com/2.0/api/sign/dapp-usage
 */
import { DAppConnector } from '../lib';
import { LedgerId } from '@hashgraph/sdk';
import { collectSessionCredentials } from '@src/utils/sharedUtils';

/*
 * Required params for the demo
 */
const params = {
  projectId: 'your dApp’s project id from https://cloud.walletconnect.com',
}

/*
 * DAppConnector - connector between hedera and walletConnect
 */
let dAppConnector: DAppConnector;

/*
 * window.onload
 * See if all required params are already in the session
 */
window.onload = function onload() {
  for (let key in params) {
    if (!sessionStorage.getItem(key)) {
      sessionStorage.clear()
      throw new Error('dApp environment not initialized')
    }
  }

  // if all env variables are initialized, show the pair button
  document.querySelectorAll('.toggle').forEach((el) => {
    el.classList.toggle('hidden')
  })
}

/*
 * Prompt user for required params
 */
// @ts-ignore
window.initializeSession = async function initialize() {
  for (const [key, message] of Object.entries(params)) {
    const value = prompt(`Please enter ${message}`) || undefined
    if (value) sessionStorage.setItem(key, value)
    else throw new Error(`No ${key} provided`)
  }

  document.querySelectorAll('.toggle').forEach((el) => {
    el.classList.toggle('hidden')
  })
}

/*
 * Initiate WalletConnect Sign Client
 */
async function initializeDAppConnector() {
  const creadentials = collectSessionCredentials();

  if (!creadentials.walletConnectProjectId) {
    throw Error('There is no walletConnectProjectId');
  }

  const metadata = {
    name: 'Example dApp',
    description: 'This is an Example dApp',
    url: 'https://hgraph.app',
    icons: ['https://walletconnect.com/walletconnect-logo.png'],
  };

  const dAppConnector = new DAppConnector(
    metadata,
    LedgerId.TESTNET,
    creadentials.walletConnectProjectId,
  );

  await dAppConnector.init({logger: 'error'});

  return dAppConnector;
}

/*
 * Connect the application and specify session permissions.
 */
document.getElementById('open-modal')!.onclick = async function openModal() {
  dAppConnector = await initializeDAppConnector();

  const connected = await dAppConnector.connectQR();
  console.log(connected);
}
/*
 * Sample transaction
 */

document.getElementById('sign-execute-transaction')!.onclick = async function() {
  // const recipientAccountId = prompt('Where would you like to send 100 hbar to?', '0.0.450178')

  // if (!recipientAccountId) return;
  
  // const walletConnectSession = signClient?.session?.getAll?.()?.[signClient?.session?.getAll?.()?.length - 1];
  // if (!walletConnectSession) return;

  // const payerAccountId = walletConnectSession.namespaces?.hedera?.accounts?.[0]?.split(':')?.[2];

  // const response = await signExecuteTransaction(signClient, {
  //   payerAccountId,
  //   recipientAccountId,
  //   hbarCount: 100,
  // })

  // console.log(response);
  // alert(`Response: ${response} \rLook in the console for more information!`);
}

document.getElementById('sign-execute-transaction-immediate')!.onclick = async function() {
  // const recipientAccountId = prompt('Where would you like to send 100 hbar to?', '0.0.450178')

  // if (!recipientAccountId) return;
  
  // const walletConnectSession = signClient?.session?.getAll?.()?.[signClient?.session?.getAll?.()?.length - 1];
  // if (!walletConnectSession) return;

  // const payerAccountId = walletConnectSession.namespaces?.hedera?.accounts?.[0]?.split(':')?.[2];

  // const response = await signExecuteTransaction(signClient, {
  //   payerAccountId,
  //   recipientAccountId,
  //   hbarCount: 100,
  //   immidiateResponse: true,
  // })

  // console.log(response);
  // alert(`Response: ${response} \rLook in the console for more information!`);
}