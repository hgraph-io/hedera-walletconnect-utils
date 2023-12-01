/*
 * Simple helpers to persist state in the browser for development purposes
 */
export function loadState() {
  const state = JSON.parse(localStorage.getItem('hedera-wc-example-saved-state') || '{}')
  for (const [key, value] of Object.entries(state))
    document
      .querySelector<HTMLInputElement>(`[name="${key}"]`)
      ?.setAttribute('value', value as string)
  // disable form inputs until wc is initialized
  document
    .querySelectorAll('.toggle input,.toggle button, .toggle select')
    .forEach((element) => {
      const typedElement = element as HTMLInputElement | HTMLButtonElement | HTMLSelectElement
      typedElement.disabled = true
    })
}

export function saveState(e: Event): { [key: string]: string } {
  e.preventDefault()
  const form = new FormData(e.target as HTMLFormElement)
  const state = JSON.parse(localStorage.getItem('hedera-wc-example-saved-state') || '{}')
  for (const [key, value] of form.entries()) state[key] = value
  // delete state['private-key'] // don't save the private key

  localStorage.setItem('hedera-wc-example-saved-state', JSON.stringify(state))
  return state
}

export function getState(key: string) {
  const state = JSON.parse(localStorage.getItem('hedera-wc-example-saved-state') || '{}')
  return state[key]
}
