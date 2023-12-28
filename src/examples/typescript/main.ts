// set iframe src
const iframe = document.querySelectorAll('iframe')
const dapp = iframe[0]
const wallet = iframe[1]
dapp.src = process.env.dappUrl!
wallet.src = process.env.walletUrl!
