'use client'

import { LogIn } from 'lucide-react'

export default function AuthPromptContent() {
  return (
    <div className="text-center mb-6 mt-2">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
        <LogIn className="w-7 h-7 text-blue-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">Tizimga kirish kerak</h2>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
        Bu sahifadan foydalanish uchun ro&apos;yxatdan o&apos;tishingiz kerak
      </p>
    </div>
  )
}
