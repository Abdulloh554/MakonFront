import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profil — Maskan',
  description: 'Shaxsiy profilingizni boshqaring va elonlaringizni ko\'ring.',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
