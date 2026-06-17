'use client'

import { LogIn, ArrowLeft } from 'lucide-react'

interface AuthPromptActionsProps {
  onLogin: () => void
  onBack: () => void
}

export default function AuthPromptActions({ onLogin, onBack }: AuthPromptActionsProps) {
  return (
    <div className="space-y-3">
      <button
        onClick={onLogin}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
      >
        <LogIn className="w-4 h-4" />
        Kirish
      </button>
      <button
        onClick={onBack}
        className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 active:scale-[0.98] transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Ortga
      </button>
    </div>
  )
}
