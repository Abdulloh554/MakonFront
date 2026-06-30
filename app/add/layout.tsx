import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Elon qo\'shish — Maskan',
  description: 'Ko\'chmas mulk elonini qo\'shing va potentsial xaridorlarni toping.',
}

export default function AddLayout({ children }: { children: React.ReactNode }) {
  return children
}
