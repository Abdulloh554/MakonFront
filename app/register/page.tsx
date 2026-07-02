'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/I18nContext'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return null
}
