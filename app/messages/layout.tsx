import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Xabarlar — Makon',
  description: 'Sotuvchilar bilan xabar almashing va ko\'chmas mulk haqida savol bering.',
}

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
