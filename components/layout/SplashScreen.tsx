'use client'

import { useState, useEffect, startTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const AUTH_PAGES = ['/login', '/register', '/auth/callback', '/reset']

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PAGES.includes(pathname)
  const [show, setShow] = useState(!isAuthPage)

  useEffect(() => {
    if (isAuthPage) return
    const seen = localStorage.getItem('makon_splash_seen')
    if (seen) {
      startTransition(() => setShow(false))
      return
    }
    const timer = setTimeout(() => {
      startTransition(() => {
        setShow(false)
        localStorage.setItem('makon_splash_seen', '1')
      })
    }, 4400)
    return () => clearTimeout(timer)
  }, [isAuthPage])

  const letters = 'MASKAN'.split('')

  return (
    <>
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: '#0C2440' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            {/* Background gradient glow */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.06 }}
              transition={{ duration: 1.5 }}
              style={{
                background:
                  'radial-gradient(circle at 30% 40%, #378ADD 0%, transparent 60%), radial-gradient(circle at 70% 60%, #378ADD 0%, transparent 60%)',
              }}
            />

            {/* Floating particles */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3 + (i % 3) * 2,
                  height: 3 + (i % 3) * 2,
                  background: i % 2 === 0 ? '#378ADD' : '#85B7EB',
                  left: `${12 + i * 15}%`,
                  top: `${18 + (i * 17) % 65}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [0, 1, 0],
                  y: [0, -40, 0],
                }}
                transition={{
                  duration: 4,
                  delay: 0.6 + i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}

            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="flex flex-col items-center gap-7 relative"
            >
              {/* Pin icon - drop from above with bounce */}
              <motion.div
                initial={{ y: -80, opacity: 0, scale: 0.6 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 10,
                  delay: 0.15,
                }}
              >
                <motion.svg
                  width="80"
                  height="88"
                  viewBox="0 0 120 132"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{
                    filter: [
                      'drop-shadow(0 0 0px #378ADD)',
                      'drop-shadow(0 0 12px #378ADD)',
                      'drop-shadow(0 0 0px #378ADD)',
                    ],
                  }}
                  transition={{ duration: 2, delay: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <motion.path
                    d="M60,0 C33,0 12,21 12,48 C12,74 60,132 60,132 C60,132 108,74 108,48 C108,21 87,0 60,0 Z"
                    fill="#378ADD"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                  <motion.circle
                    cx="60" cy="46" r="24" fill="#FFFFFF"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.9 }}
                  />
                  <motion.circle
                    cx="60" cy="46" r="10" fill="#378ADD"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, delay: 1.2 }}
                  />
                </motion.svg>
              </motion.div>

              {/* MASKAN - per-letter animation */}
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {letters.map((letter, i) => (
                  <motion.span
                    key={i}
                    className="text-4xl font-bold tracking-tight inline-block"
                    style={{ color: '#FFFFFF' }}
                    initial={{ y: 50, opacity: 0, rotateX: -80 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 10,
                      delay: 0.7 + i * 0.13,
                    }}
                    whileHover={{
                      scale: 1.2,
                      color: '#378ADD',
                      transition: { type: 'spring', stiffness: 400 },
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
                <motion.span
                  className="w-2 h-2 rounded-full ml-2"
                  style={{ background: '#378ADD' }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.7, type: 'spring', stiffness: 400 }}
                />
              </motion.div>

              {/* Tagline with reveal */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.6, ease: 'easeOut' }}
                className="flex flex-col items-center"
              >
                <motion.span
                  className="text-xs tracking-[0.35em] font-medium"
                  style={{ color: '#85B7EB' }}
                  initial={{ opacity: 0, letterSpacing: '0.8em' }}
                  animate={{ opacity: 1, letterSpacing: '0.35em' }}
                  transition={{ delay: 2, duration: 0.8, ease: 'easeOut' }}
                >
                  KO&apos;CHMAS MULK PLATFORMASI
                </motion.span>
                <motion.div
                  className="h-px mt-3"
                  style={{ background: 'linear-gradient(90deg, transparent, #378ADD, transparent)', width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 2.4, duration: 0.6, ease: 'easeOut' }}
                />
              </motion.div>
            </motion.div>

            {/* Bottom loading dots */}
            <motion.div
              className="absolute bottom-16 flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#85B7EB' }}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
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
