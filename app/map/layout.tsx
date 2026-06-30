import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Xarita — Maskan',
  description: 'Ko\'chmas mulklarni xaritada toping va atrofni o\'rganing.',
}

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children
}
