'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, login, register, logout, getPropertiesByUser, syncProperties, syncSellers } from '@/store'
import { useHydrated } from '@/hooks/useHydrated'
import PropertyCard from '@/components/features/properties/PropertyCard'
import PropertyModal from '@/components/features/properties/PropertyModal'
import PageTransition from '@/components/layout/PageTransition'
import StaggerGrid, { StaggerItem } from '@/components/layout/StaggerGrid'
import LoginForm from '@/components/features/auth/LoginForm'
import ProfileHeader from '@/components/features/sellers/ProfileHeader'
import EmptyState from '@/components/ui/EmptyState'
import type { User, Property } from '@/types'
import { Home, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const router = useRouter()
  const hydrated = useHydrated()
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

  const [user, setUser] = useState<User | null>(() => {
    if (hydrated) return getCurrentUser()
    return null
  })
  const [showLogin, setShowLogin] = useState(() => {
    if (hydrated) return !getCurrentUser()
    return true
  })

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (!active) return
      const u = getCurrentUser()
      setUser(u)
      setShowLogin(!u)
    })
    return () => { active = false }
  }, [hydrated])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  async function handleLogin(name: string, lastName: string, phone: string, password: string) {
    const user = await login(phone, password)
    const [syncedProps] = await Promise.all([syncProperties(), syncSellers()])
    setUser(getCurrentUser())
    setShowLogin(false)
    setSyncedProperties(syncedProps)
    return user
  }

  async function handleRegister(name: string, lastName: string, phone: string, password: string) {
    const user = await register(name, lastName, phone, password)
    const [syncedProps] = await Promise.all([syncProperties(), syncSellers()])
    setUser(getCurrentUser())
    setShowLogin(false)
    setSyncedProperties(syncedProps)
    return user
  }

  function handleLogout() {
    logout()
    setUser(null)
    setShowLogin(true)
  }

  if (showLogin || !user) {
    return (
      <PageTransition>
        <div className="flex-1 flex items-center justify-center px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
            className="w-full max-w-sm space-y-3"
          >
            <LoginForm onLogin={handleLogin} onRegister={handleRegister} />
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  const myProperties = syncedProperties.length > 0
    ? getPropertiesByUser(user, syncedProperties)
    : getPropertiesByUser(user)

  return (
    <PageTransition>
      <ProfileHeader user={user} propertyCount={myProperties.length} onLogout={handleLogout} />

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
