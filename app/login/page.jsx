'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [savedCode, setSavedCode] = useState('')
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => setShowFallback(true), 30000)
      return () => clearTimeout(timer)
    }
    setShowFallback(false)
  }, [step])

  async function handleSendCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setSavedCode(data.code || '')
    setSent(true)
    setStep(2)
    setLoading(false)
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setUser({ ...data.user, firstName: data.user.name })
    router.push('/profile')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900">Kirish</h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === 1 ? 'Parolingiz emailga yuboriladi' : 'Emailga kelgan parolni kiriting'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="example@gmail.com"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                boxShadow: '0 4px 12px rgba(24,95,165,0.25)',
              }}
            >
              {loading ? 'Yuborilmoqda...' : 'Parolni olish'}
            </button>
          </form>
        )}

          {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#ecfdf5' }}>
                <Mail className="w-5 h-5" style={{ color: '#059669' }} />
              </div>
              <p className="text-sm font-semibold text-slate-800">Parol emailingizga yuborildi!</p>
              <p className="text-xs text-slate-400 mt-1">{email}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emailga yuborilgan parol</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition-colors text-center tracking-[4px] font-bold"
                placeholder="Parolni kiriting"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                boxShadow: '0 4px 12px rgba(24,95,165,0.25)',
              }}
            >
              {loading ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>

            {showFallback && savedCode && (
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400">Parol kelmadimi?</p>
                <button
                  type="button"
                  onClick={() => setCode(savedCode)}
                  className="text-xs font-semibold underline underline-offset-2"
                  style={{ color: '#185FA5' }}
                >
                  Parolni avtomatik to'ldirish
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setCode(''); setSent(false) }}
              className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
            >
              Orqaga
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400 mt-4">
          Hisobingiz yo&apos;qmi?{' '}
          <Link href="/register" className="font-semibold" style={{ color: '#185FA5' }}>
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>
    </div>
  )
}
