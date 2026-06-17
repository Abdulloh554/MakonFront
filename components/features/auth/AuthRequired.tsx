'use client'

import { useRouter } from 'next/navigation'
import { LogIn, ArrowLeft } from 'lucide-react'

export default function AuthRequired() {
  const router = useRouter()

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mx-auto shadow-inner">
          <LogIn className="w-10 h-10 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tizimga kirish talab qilinadi</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Bu sahifadan foydalanish uchun avval tizimga kirishingiz kerak.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/profile')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
          >
            <LogIn className="w-4 h-4" />
            Tizimga kirish
          </button>
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga qaytish
          </button>
        </div>
      </div>
    </div>
  )
}
