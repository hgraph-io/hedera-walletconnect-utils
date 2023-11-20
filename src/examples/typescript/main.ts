// set iframe src
const iframe = document.querySelectorAll('iframe')
const dapp = iframe[0]
const wallet = iframe[1]
dapp.src = process.env.dappUrl
wallet.src = process.env.walletUrl

// more easily see which iframe is focused
function checkFocus() {
  if (document.activeElement === dapp) {
    dapp.style.filter = 'none'
    wallet.style.filter = 'blur(1px) opacity(0.2)'
  } else {
    dapp.style.filter = 'blur(1px) opacity(0.2)'
    wallet.style.filter = 'none'
  }
}
window.setInterval(checkFocus, 200)
