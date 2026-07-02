'use client'

import { useI18n } from '@/lib/i18n/I18nContext'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
  delay?: number
  error?: string
  className?: string
}

export default function FormField({ label, children, delay = 0, error, className = '' }: FormFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={className}
    >
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </motion.div>
  )
}
