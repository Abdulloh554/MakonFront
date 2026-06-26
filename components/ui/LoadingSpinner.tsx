'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  text?: string
  className?: string
}

export default function LoadingSpinner({ text = 'Yuklanmoqda...', className = '' }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-label={text} className={`flex-1 flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Gradient spinner */}
        <div className="relative w-10 h-10">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, transparent 70%, #185FA5 100%)',
            }}
          />
          <div
            className="absolute inset-0.5 rounded-full"
            style={{ background: 'white' }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #185FA5, #378ADD)',
              opacity: 0.1,
            }}
          />
        </div>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#94a3b8' }}
            />
          ))}
        </div>

        <p className="text-sm font-medium text-slate-400">{text}</p>
      </motion.div>
    </div>
  )
}
