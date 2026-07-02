'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/I18nContext'

export default function ResetPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [status, setStatus] = useState(t('common.loading'))
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function reset() {
      try {
        await fetch('/api/reset', { method: 'POST' })
      } catch {}

      if (typeof window !== 'undefined') {
        localStorage.clear()
      }

      setStatus(t('reset.success'))
      setDone(true)
    }
    reset()
  }, [])

  if (!done) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>{status}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', gap: '16px' }}>
      <h1>{status}</h1>
      <button
        onClick={() => router.push('/')}
        style={{
          padding: '12px 24px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {t('not_found.home')}
      </button>
    </div>
  )
}
