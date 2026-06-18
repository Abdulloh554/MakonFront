'use client'

import { useState } from 'react'
import { Star, Phone, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Seller } from '@/types'
import { getCurrentUser, getProperties, sendMessage } from '@/store'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

interface SellerHeaderProps {
  seller: Seller
}

export default function SellerHeader({ seller }: SellerHeaderProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [showPhone, setShowPhone] = useState(false)

  function handleContact() {
    const user = getCurrentUser()
    if (!user) {
      router.push('/profile')
      return
    }
    const props = getProperties().filter(p => p.sellerId === seller.id)
    if (props.length > 0) {
      router.push(`/messages?property=${props[0].id}`)
    } else {
      sendMessage(user.id, seller.id, 'general', 'Assalomu alaykum')
      router.push(`/messages?sellerId=${seller.id}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100"
    >
      <div className="px-4 md:px-6 lg:px-8 py-5 flex items-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
          className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-sm"
        >
          {seller.name.charAt(0)}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg md:text-xl text-gray-900">{seller.name}</h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-gray-700">{seller.rating}</span>
            </div>
            <span className="text-sm text-gray-500">{seller.totalListings} ta elon</span>
            <button
              onClick={() => setShowPhone(!showPhone)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              {showPhone ? seller.phone : 'Telefonni ko\'rish'}
            </button>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContact}
          className="p-3 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}
