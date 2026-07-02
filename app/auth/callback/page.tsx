'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/I18nContext'
import { getAuthInstance, isSignInWithEmailLink, signInWithEmailLink } from '@/lib/firebase'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'

const auth = getAuthInstance()

export default function AuthCallbackPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const { t } = useI18n()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function handleSignIn() {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setError('Noto\'g\'ri havola')
        setLoading(false)
        return
      }

      let email = window.localStorage.getItem('emailForSignIn')
      if (!email) {
        email = window.prompt('Iltimos, emailingizni kiriting')
      }

      if (!email) {
        setError('Email kiritilmadi')
        setLoading(false)
        return
      }

      try {
        const result = await signInWithEmailLink(auth, email, window.location.href)
        window.localStorage.removeItem('emailForSignIn')

        const idToken = await result.user.getIdToken()

        const data = await authApi.firebase(idToken)

        setUser(data.user)
        router.push('/profile')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kirishda xatolik yuz berdi')
        setLoading(false)
      }
    }

    handleSignIn()
  }, [router, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center" style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}>
        {loading && (
          <>
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">{t('common.loading')}</p>
          </>
        )}
        {error && (
          <>
            <p className="text-sm text-red-500 font-medium mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="text-xs font-semibold underline underline-offset-2"
              style={{ color: '#185FA5' }}
            >
              {t('error.retry')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
