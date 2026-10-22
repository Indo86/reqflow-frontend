import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom does not implement the native <dialog> element's modal behavior.
// Polyfill just enough of it (open state + showModal/close) so components
// using <dialog> can be tested without reaching into browser internals.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
}
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
}

// findBy*/waitFor default to 1s, which a loaded machine exceeds while a whole page
// (request + approvals + audit queries) renders in jsdom. Slower, not looser:
// the assertions are unchanged.
configure({ asyncUtilTimeout: 5000 })

afterEach(() => cleanup())
