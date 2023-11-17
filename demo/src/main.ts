function checkFocus() {
  const iframes = document.getElementsByTagName('iframe')
  const dApp = iframes[0]
  const wallet = iframes[1]
  if (document.activeElement === dApp) {
    dApp.style.filter = 'invert(1)'
    wallet.style.filter = 'blur(1px) opacity(0.2)'
  } else {
    dApp.style.filter = 'blur(1px) opacity(0.2)'
    wallet.style.filter = 'invert(1)'
  }
}

window.setInterval(checkFocus, 200)
