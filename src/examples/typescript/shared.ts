/*
 * Simple remedial helpers to persist state in the browser for development purposes
 */

export function loadState() {
  const state = JSON.parse(localStorage.getItem('hedera-wc-example-saved-state') || '{}')
  for (const [key, value] of Object.entries(state))
    document.querySelector<HTMLInputElement>(key)?.setAttribute('value', value as string)
}

export function saveState(form: FormData): void {
  const state = JSON.parse(localStorage.getItem('hedera-wc-example-saved-state') || '{}')
  for (const [key, value] of form.entries()) state[key] = value
  localStorage.setItem('hedera-wc-example-saved-state', JSON.stringify(state))
}

export function getState(key: string) {
  const state = JSON.parse(localStorage.getItem('hedera-wc-example-saved-state') || '{}')
  return state[key]
}
