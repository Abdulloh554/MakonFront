'use client'

import { useState, useEffect, startTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const seen = sessionStorage.getItem('makon_splash_seen')
    if (seen) {
      startTransition(() => setShow(false))
      return
    }
    const timer = setTimeout(() => {
      startTransition(() => {
        setShow(false)
        sessionStorage.setItem('makon_splash_seen', '1')
      })
    }, 3200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: '#0C2440' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="flex flex-col items-center gap-6"
            >
              <motion.svg
                width="88"
                height="96"
                viewBox="0 0 120 132"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <path d="M60,0 C33,0 12,21 12,48 C12,74 60,132 60,132 C60,132 108,74 108,48 C108,21 87,0 60,0 Z" fill="#378ADD"/>
                <circle cx="60" cy="46" r="24" fill="#FFFFFF"/>
                <circle cx="60" cy="46" r="10" fill="#378ADD"/>
              </motion.svg>

              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <span
                  className="text-4xl font-bold tracking-tight"
                  style={{ color: '#FFFFFF' }}
                >
                  makon
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#378ADD' }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <span
                  className="text-xs tracking-[0.35em] font-medium"
                  style={{ color: '#85B7EB' }}
                >
                  KO&apos;CHMAS MULK PLATFORMASI
                </span>
                <motion.div
                  className="h-px mt-3 mx-auto"
                  style={{ background: '#378ADD', width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </>
  )
}
