'use client'

import { lazy, Suspense, useState } from 'react'

const GoogleButton = lazy(() => import('./GoogleButton'))

interface GoogleAuthWrapperProps {
  clientId: string
  onSuccess: (credentialResponse: { credential?: string }) => void
  onError: () => void
}

export default function GoogleAuthWrapper({ clientId, onSuccess, onError }: GoogleAuthWrapperProps) {
  const [loaded, setLoaded] = useState(false)

  if (!clientId) {
    return null
  }

  if (!loaded) {
    return (
      <div className="space-y-3">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="w-full max-w-[300px] py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Google orqali kirish
          </button>
        </div>
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-medium text-gray-600">yoki</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Suspense fallback={<div className="h-[40px] w-[300px] bg-gray-100 rounded-lg animate-pulse" />}>
          <GoogleButton clientId={clientId} onSuccess={onSuccess} onError={onError} />
        </Suspense>
      </div>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-600">yoki</span>
        <span className="flex-1 h-px bg-gray-200" />
      </div>
    </div>
  )
}
