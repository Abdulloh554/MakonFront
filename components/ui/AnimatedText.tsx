'use client'

import { motion } from 'framer-motion'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  once?: boolean
  hoverEffect?: boolean
}

export default function AnimatedText({
  text,
  className = '',
  delay = 0,
  stagger = 0.03,
  hoverEffect = true,
}: AnimatedTextProps) {
  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0, rotateX: -40 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 12,
            delay: delay + i * stagger,
          }}
          className="inline-block"
          {...(hoverEffect
            ? {
                whileHover: {
                  scale: 1.15,
                  color: '#378ADD',
                  transition: { type: 'spring', stiffness: 400 },
                },
              }
            : {})}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}
