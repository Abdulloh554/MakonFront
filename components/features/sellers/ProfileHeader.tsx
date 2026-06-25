'use client'

import { LogOut, Home, Phone, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import type { User } from '@/types'

interface ProfileHeaderProps {
  user: User
  propertyCount: number
  onLogout: () => void
}

export default function ProfileHeader({ user, propertyCount, onLogout }: ProfileHeaderProps) {
  const hasPhone = user.phone && user.phone.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-4 md:px-6 lg:px-8 pt-6 pb-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl md:text-3xl ring-2 ring-white/30 backdrop-blur-sm"
          >
            {user.name?.charAt(0) || 'U'}
          </motion.div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">{user.name || 'Foydalanuvchi'}</h1>
            <div className="flex items-center gap-1.5 text-sm text-blue-100 mt-0.5">
              {hasPhone ? (
                <>
                  <Phone className="w-3.5 h-3.5" />
                  <span>{user.phone}</span>
                </>
              ) : user.email ? (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm"
          title="Chiqish"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mt-4 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm w-fit"
      >
        <Home className="w-4 h-4 text-blue-100" />
        <span className="text-sm text-white font-medium">{propertyCount} ta elon</span>
      </motion.div>
    </motion.div>
  )
}
