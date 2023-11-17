import { collectSessionCredentials } from '@src/utils/sharedUtils';
import Wallet from '../lib/wallet';
import {HederaChainId} from '../lib';

/*
 * Required params for the demo
 */
const params = {
  accountId: 'your Hedera testnet account id. (https://portal.hedera.com/)',
  privateKey: 'your Hedera testnet private key. (https://portal.hedera.com/)',
  projectId: 'your wallet’s project id from https://cloud.walletconnect.com',
}

/*
 * wallet
 */
let wallet: Wallet;

/*
 * window.onload
 * See if all required params are already in the session
 */
window.onload = async function onload() {
  for (const [key, _] of Object.entries(params))
    if (!sessionStorage.getItem(key)) {
      sessionStorage.clear()
      throw new Error('Wallet environment not initialized')
    }

  // if all env variables are initialized, show the pair button
  document.querySelectorAll('.toggle').forEach((el) => {
    el.classList.toggle('hidden')
  })

  // init library wallet
  wallet = await initializeWallet();
}

/*
 * Prompt user for required params
 */
// @ts-ignore
window.initializeSession = async function initialize() {
  for (const [key, message] of Object.entries(params)) {
    let value: string | undefined = undefined
    while (!value) value = prompt(`Please enter ${message}`) || undefined

    if (value) sessionStorage.setItem(key, value)
    else throw new Error(`No ${key} provided`)
  }

  document.querySelectorAll('.toggle').forEach((el) => {
    el.classList.toggle('hidden')
  })
}
/*
 * WalletConnect setup
 * https://docs.walletconnect.com/2.0/api/sign/dapp-usage
 */
async function initializeWallet() {
  console.log('initializeWallet call');
  const creadentials = collectSessionCredentials();

  if (!creadentials.hederaAccountId) {
    throw Error('There is no hederaAccountId');
  }
  if (!creadentials.hederaPrivateKey) {
    throw Error('There is no hederaPrivateKey');
  }
  if (!creadentials.walletConnectProjectId) {
    throw Error('There is no walletConnectProjectId');
  }
  console.log('before new Wallet')
  console.log(Wallet.prototype.constructor);
  const wallet = new Wallet();

  console.log(creadentials.walletConnectProjectId);
  console.log(wallet);
  console.log('before WalletInit')
  wallet.init(creadentials.walletConnectProjectId, {
    name: 'Wallet',
    description: 'This is a wallet.',
    url: 'https://hgraph.app',
    icons: ['https://walletconnect.com/walletconnect-logo.png'],
  });

  console.log('before addApprovedAccount')
  wallet.addApprovedAccount(creadentials.hederaAccountId, creadentials.hederaPrivateKey, HederaChainId.Testnet);

  return wallet;
}

/*
 * Create a session on user action
 */
// @ts-ignore
window.pair = async function pair() {
  const uri = (document.querySelector('input[name="uri"]') as HTMLInputElement)?.value
  if (!uri) throw new Error('No URI')

  const connected = await wallet.pair({ uri });
  console.log(connected);
}
