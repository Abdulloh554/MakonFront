'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/I18nContext'
import { ArrowLeft, Home, MessageCircle, Star, Send, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '@/components/layout/PageTransition'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import PropertyCard from '@/components/features/properties/PropertyCard'
import PropertyModal from '@/components/features/properties/PropertyModal'
import StaggerGrid, { StaggerItem } from '@/components/layout/StaggerGrid'
import { fetchSeller, fetchSellerProperties, fetchReviewsBySeller, addReview, getCurrentUser } from '@/store'
import { useHydrated } from '@/hooks/useHydrated'
import type { Seller, Property, Review } from '@/types'
import { useToast } from '@/components/ui/ToastProvider'

export default function SellerDetailPage() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { showToast } = useToast()
  const hydrated = useHydrated()

  const [seller, setSeller] = useState<Seller | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'properties' | 'reviews'>('properties')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!hydrated || !id) return
    async function load() {
      setLoading(true)
      const [s, props, revs] = await Promise.all([
        fetchSeller(id),
        fetchSellerProperties(id),
        fetchReviewsBySeller(id),
      ])
      setSeller(s ?? null)
      setProperties(props)
      setReviews(revs)
      setLoading(false)
    }
    load()
  }, [hydrated, id])

  if (!hydrated || loading) {
    return <PageTransition><div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div></PageTransition>
  }

  if (!seller) {
    return (
      <PageTransition>
        <div className="flex-1 flex items-center justify-center px-4">
          <EmptyState
            icon={<User className="w-8 h-8 text-slate-300" />}
            title={t('sellers.no_sellers')}
            action={{ label: t('common.back'), onClick: () => router.push('/sellers') }}
          />
        </div>
      </PageTransition>
    )
  }

  const user = getCurrentUser()
  const userReview = user ? reviews.find((r) => r.userId === user.id) : null

  async function handleSubmitReview() {
    if (!user || !seller || !reviewText.trim()) return
    setSubmitting(true)
    try {
      const newReview = await addReview({
        sellerId: seller.id,
        userId: user.id,
        userName: user.name,
        rating: reviewRating,
        text: reviewText.trim(),
      })
      setReviews((prev) => [newReview, ...prev])
      setReviewText('')
      setReviewRating(5)
      setShowReviewForm(false)
      showToast(t('toast.success'), 'success')
    } catch {
      showToast(t('toast.error'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const tabs = [
    { key: 'properties' as const, label: t('sellers.listings'), count: properties.length, icon: Home },
    { key: 'reviews' as const, label: t('sellers.reviews'), count: reviews.length, icon: Star },
  ]

  return (
    <PageTransition>
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 md:px-6 lg:px-8 pt-4 pb-3"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(226,232,240,0.7)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--gray-100)' }}
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </motion.button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #185FA5, #378ADD)' }}
            >
              {seller.name.charAt(0)}
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">{seller.name}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-amber-600">{seller.rating}</span>
                </div>
                <span>{t('sellers.properties_count', { n: seller.totalListings })}</span>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/messages?sellerId=${seller.id}`)}
            className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex-1 justify-center"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #185FA5, #378ADD)' : 'var(--gray-100)',
                  color: isActive ? 'white' : 'var(--gray-500)',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--gray-200)',
                  }}
                >
                  {tab.count}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 lg:px-8 pt-5 pb-28 lg:pb-8">
        <AnimatePresence mode="wait">
          {activeTab === 'properties' ? (
            <motion.div
              key="properties"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {properties.length === 0 ? (
                <EmptyState
                  icon={<Home className="w-8 h-8 text-slate-300" />}
                  title={t('sellers.no_sellers')}
                  description=""
                />
              ) : (
                <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {properties.map((p) => (
                    <StaggerItem key={p.id}>
                      <PropertyCard property={p} onClick={() => setSelectedProperty(p)} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto space-y-4"
            >
              {/* Add review button */}
              {user && !userReview && !showReviewForm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReviewForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                    boxShadow: '0 6px 20px rgba(24,95,165,0.28)',
                  }}
                >
                  <Star className="w-4 h-4" />
                  {t('sellers.reviews')}
                </motion.button>
              )}

              {/* Review form */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="p-4 rounded-2xl space-y-3"
                      style={{
                        background: 'var(--gray-50)',
                        border: '1px solid var(--gray-150)',
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setReviewRating(star)}
                          >
                            <Star
                              className="w-6 h-6 transition-colors"
                              style={{
                                fill: star <= reviewRating ? '#f59e0b' : 'none',
                                color: star <= reviewRating ? '#f59e0b' : '#d1d5db',
                              }}
                            />
                          </motion.button>
                        ))}
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder={t('messages.type_placeholder')}
                        className="w-full p-3 rounded-xl text-sm resize-none outline-none"
                        style={{
                          background: 'var(--surface)',
                          border: '1.5px solid var(--gray-200)',
                          minHeight: 80,
                        }}
                        maxLength={1000}
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowReviewForm(false)
                            setReviewText('')
                            setReviewRating(5)
                          }}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ background: 'var(--gray-200)', color: 'var(--gray-600)' }}
                        >
                          {t('common.cancel')}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmitReview}
                          disabled={!reviewText.trim() || submitting}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, #185FA5, #378ADD)',
                          }}
                        >
                          <Send className="w-3.5 h-3.5" />
                          {submitting ? t('common.loading') : t('messages.send')}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reviews list */}
              {reviews.length === 0 && !showReviewForm ? (
                <EmptyState
                  icon={<Star className="w-8 h-8 text-slate-300" />}
                  title={t('sellers.no_reviews')}
                  description=""
                />
              ) : (
                reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'var(--surface)',
                      border: '1.5px solid var(--gray-200)',
                      boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}
                      >
                        {review.userName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-slate-800 truncate">{review.userName}</span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{review.text}</p>
                        <p className="text-[11px] text-slate-400 mt-2">
                          {new Date(review.createdAt).toLocaleDateString('uz-UZ', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </PageTransition>
  )
}
