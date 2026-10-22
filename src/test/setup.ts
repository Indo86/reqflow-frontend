import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Menambahkan perilaku dialog yang belum tersedia di jsdom.
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

// Memberi waktu lebih untuk render halaman lengkap saat pengujian.
configure({ asyncUtilTimeout: 5000 })

afterEach(() => cleanup())
