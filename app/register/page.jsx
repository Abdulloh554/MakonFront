'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/services/api'
import { auth, sendSignInLinkToEmail } from '@/lib/firebase'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { Mail } from 'lucide-react'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const ACTION_CODE_SETTINGS = {
  url: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
  handleCodeInApp: true,
}

function RegisterInner() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSendLink(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      window.localStorage.setItem('emailForSignIn', email)
      window.localStorage.setItem('userNameForSignUp', name)
      window.localStorage.setItem('userLastNameForSignUp', lastName)
      await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS)
      setSent(true)
    } catch (err) {
      setError(err?.message || 'Xatolik yuz berdi')
    }
    setLoading(false)
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError('')
    setLoading(true)
    try {
      const idToken = credentialResponse.credential
      const data = await authApi.google(idToken)
      setUser(data.user)
      router.push('/profile')
    } catch (err) {
      setError(err?.message || "Google orqali ro'yxatdan o'tishda xatolik yuz berdi.")
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8fafc' }}>
        <div
          className="w-full max-w-sm bg-white rounded-2xl p-6 text-center"
          style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: '#ecfdf5' }}
          >
            <Mail className="w-5 h-5" style={{ color: '#059669' }} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Havola yuborildi!</h1>
          <p className="text-sm text-slate-500 mb-1">
            Elektron pochtangizga ro&apos;yxatdan o&apos;tish havolasi yuborildi.
          </p>
          <p className="text-xs text-slate-400 mb-4">{email}</p>
          <p className="text-xs text-slate-400">Havolani bossangiz, avtomatik tarzda ro&apos;yxatdan o&apos;tasiz.</p>
          <button
            onClick={() => {
              setSent(false)
            }}
            className="mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
          >
            Orqaga
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900">Ro&apos;yxatdan o&apos;tish</h1>
          <p className="text-xs text-slate-400 mt-1">Makon platformasiga yangi hisob yarating</p>
        </div>

        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Ism</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition-colors"
              placeholder="Abdulloh"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Familiya</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition-colors"
              placeholder="Aliyev"
            />
          </div>
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

          {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #185FA5, #378ADD)',
              boxShadow: '0 4px 12px rgba(24,95,165,0.25)',
            }}
          >
            {loading ? 'Yuborilmoqda...' : "Email orqali ro'yxatdan o'tish"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-slate-400">yoki</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google orqali ro'yxatdan o'tishda xatolik yuz berdi.")}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="300"
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Hisobingiz bormi?{' '}
          <Link href="/login" className="font-semibold" style={{ color: '#185FA5' }}>
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RegisterInner />
    </GoogleOAuthProvider>
  )
}
