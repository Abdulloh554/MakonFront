'use client'

import { useI18n } from '@/lib/i18n/I18nContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LoadingPage() {
  const { t } = useI18n()

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  )
}
