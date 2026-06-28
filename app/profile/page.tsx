'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { getPropertiesByUser, syncProperties, syncSellers } from '@/store'
import { useHydrated } from '@/hooks/useHydrated'
import PropertyCard from '@/components/features/properties/PropertyCard'
import PropertyModal from '@/components/features/properties/PropertyModal'
import PageTransition from '@/components/layout/PageTransition'
import StaggerGrid, { StaggerItem } from '@/components/layout/StaggerGrid'
import ProfileHeader from '@/components/features/sellers/ProfileHeader'
import EmptyState from '@/components/ui/EmptyState'
import type { Property, User, UserRole, AuthProvider } from '@/types'
import { Home, Plus, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface ProfileUser {
  id?: string
  name: string
  lastName?: string
  email?: string
  phone?: string
  firstName?: string
  avatar?: string
  role?: UserRole
  isActive?: boolean
  isVerified?: boolean
  provider?: AuthProvider
  createdAt?: string
  updatedAt?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const authUser = useAuthStore((s) => s.user)
  const authLogout = useAuthStore((s) => s.logout)
  const [syncedProperties, setSyncedProperties] = useState<Property[]>([])

  useEffect(() => {
    if (!hydrated) return
    let active = true
    Promise.all([syncProperties(), syncSellers()]).then(([syncedProps]) => {
      if (active) {
        setSyncedProperties(syncedProps)
      }
    })
    return () => { active = false }
  }, [hydrated])

  const user = useMemo<ProfileUser | null>(() => {
    if (!hydrated || !authUser) return null
    return {
      id: authUser.id,
      name: authUser.firstName || authUser.name || '',
      lastName: authUser.lastName,
      email: authUser.email,
      phone: authUser.phone || '',
    }
  }, [authUser, hydrated])

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  function handleLogout() {
    authLogout()
  }

  if (!hydrated) return null

  if (!user) {
    return (
      <PageTransition>
        <div className="flex-1 flex items-center justify-center px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
            className="w-full max-w-sm text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-200"
            >
              <UserIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-xl font-bold text-gray-900">Profilingizga kiring</h1>
            <p className="text-sm text-gray-500">Telefon raqam orqali kirish yoki ro&apos;yxatdan o&apos;tish</p>
            <div className="space-y-2.5 pt-2">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/login"
                className="block w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                  boxShadow: '0 4px 12px rgba(24,95,165,0.25)',
                }}
              >
                Kirish
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/register"
                className="block w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: 'white',
                  color: '#185FA5',
                  border: '1.5px solid rgba(24,95,165,0.2)',
                }}
              >
                Ro&apos;yxatdan o&apos;tish
              </motion.a>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  const displayUser = {
    ...user,
    id: user.id || '',
    firstName: user.firstName || user.name,
    lastName: user.lastName || '',
    name: user.name || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
    role: user.role || 'user',
    isActive: user.isActive ?? true,
    isVerified: user.isVerified ?? false,
    provider: user.provider || 'local',
    createdAt: user.createdAt || '',
    updatedAt: user.updatedAt || '',
  } satisfies User

  const myProperties = syncedProperties.length > 0
    ? getPropertiesByUser(displayUser, syncedProperties)
    : getPropertiesByUser(displayUser)

  return (
    <PageTransition>
      <ProfileHeader user={displayUser} propertyCount={myProperties.length} onLogout={handleLogout} />

      <div className="flex-1 px-4 md:px-6 lg:px-8 pt-4 pb-24 lg:pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Mening elonlarim</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/add')}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Yangi elon
          </motion.button>
        </div>

        {myProperties.length === 0 ? (
          <EmptyState
            icon={<Home className="w-8 h-8 text-gray-300" />}
            title="Hali elonlaringiz yo'q"
            action={{ label: "Birinchi elonni qo'shish", onClick: () => router.push('/add') }}
          />
        ) : (
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {myProperties.map((p) => (
              <StaggerItem key={p.id}>
                <PropertyCard property={p} onClick={() => setSelectedProperty(p)} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>

      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </PageTransition>
  )
}
