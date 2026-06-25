'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'

export default function RegisterPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', lastName: '', email: '' })
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [savedCode, setSavedCode] = useState('')
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => setShowFallback(true), 30000)
      return () => clearTimeout(timer)
    }
    setShowFallback(false)
  }, [step])

  async function handleSubmitInfo(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setEmail(form.email)
    setSavedCode(data.code || '')
    setMessage('6 xonali kod emailingizga yuborildi. Iltimos, pochtangizni tekshiring.')
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
          <h1 className="text-xl font-bold text-slate-900">
            {step === 1 ? "Ro'yxatdan o'tish" : 'Kodni tasdiqlash'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === 1
              ? "Makon platformasiga yangi hisob yarating"
              : 'Emailingizga yuborilgan 6 xonali kodni kiriting'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmitInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ismingiz</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="Abdulloh"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Familiyangiz</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition-colors"
                placeholder="Aliyev"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              {loading ? 'Yuborilmoqda...' : "Ro'yxatdan o'tish"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            {message && (
              <p className="text-xs text-green-600 font-medium text-center bg-green-50 rounded-xl px-3 py-2">
                {message}
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emailga yuborilgan kod</label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition-colors text-center text-lg tracking-[8px] font-bold"
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <p className="text-xs text-slate-400 text-center">
              Kod <strong className="text-slate-600">{email}</strong> manziliga yuborildi
            </p>

            {error && (
              <p className="text-xs text-red-500 font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                boxShadow: '0 4px 12px rgba(24,95,165,0.25)',
              }}
            >
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>

            {showFallback && savedCode && (
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400">Kod kelmadimi?</p>
                <button
                  type="button"
                  onClick={() => setCode(savedCode)}
                  className="text-xs font-semibold underline underline-offset-2"
                  style={{ color: '#185FA5' }}
                >
                  Kodni avtomatik to'ldirish
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setCode(''); setMessage('') }}
              className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
            >
              Orqaga
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#185FA5' }}>
              Kirish
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
