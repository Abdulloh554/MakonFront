'use client'

import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  icon?: React.ReactNode
  subtitle?: string | React.ReactNode
  rightContent?: React.ReactNode
  className?: string
}

export default function PageHeader({ title, icon, subtitle, rightContent, className = '' }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={`sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-4 md:px-6 lg:px-8 py-3.5 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {icon && (
          <motion.div
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="shrink-0"
          >
            {icon}
          </motion.div>
        )}
        <div className="min-w-0">
          <motion.h1
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="text-base font-bold text-gray-900"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-[10px] text-gray-400 font-medium mt-0.5"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        {rightContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="ml-auto"
          >
            {rightContent}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
