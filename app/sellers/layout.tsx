import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sotuvchilar — Maskan',
  description: 'Ko\'chmas mulk sotuvchilari va agentlari. Toshkentdagi eng ishonchli sotuvchilar.',
}

export default function SellersLayout({ children }: { children: React.ReactNode }) {
  return children
}
