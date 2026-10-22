import { formatRupiah } from '@/lib/utils/format-currency'

// Menyiapkan data untuk ditampilkan di antarmuka.
export function formatRequestAmount(amount: string | null): string {
  if (amount === null) return '—'
  return formatRupiah(Number(amount))
}
