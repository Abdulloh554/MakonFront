'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import FormField from '@/components/ui/FormField'
import Select from '@/components/ui/Select'
import { Map, Upload, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n/I18nContext'

const MapPicker = dynamic(() => import('@/components/features/map/MapPicker'), { ssr: false })

export interface PropertyFormData {
  title: string
  description: string
  price: number
  type: string
  dealType: string
  status: string
  imageFiles: File[]
  area: number
  rooms: number
  floor: number
  totalFloors: number
  installmentMonths: number
  address: string
  lat: number
  lng: number
}

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>
  onSubmit: (data: PropertyFormData) => void
  saving?: boolean
}

const defaultData: PropertyFormData = {
  title: '', description: '', price: 0,
  type: '', dealType: '', status: '',
  imageFiles: [], area: 0, rooms: 0,
  floor: 0, totalFloors: 0, installmentMonths: 0,
  address: '', lat: 0, lng: 0,
}

export default function PropertyForm({ initialData, onSubmit, saving = false }: PropertyFormProps) {
  const { t } = useI18n()

  const propertyTypes = [
    { value: 'apartment', label: t('property.type.apartment') },
    { value: 'house', label: t('property.type.house') },
    { value: 'cottage', label: t('property.type.cottage') },
    { value: 'dacha', label: t('property.type.dacha') },
    { value: 'commercial', label: t('property.type.commercial') },
    { value: 'land', label: t('property.type.land') },
  ]

  const dealTypes = [
    { value: 'daily', label: t('property.deal.daily') },
    { value: 'sale', label: t('property.deal.sale') },
    { value: 'rent', label: t('property.deal.rent') },
    { value: 'installment', label: t('property.deal.installment') },
  ]

  const statuses = [
    { value: 'ready', label: t('property.status.ready') },
    { value: 'half-ready', label: t('property.status.half_ready') },
    { value: 'land', label: t('property.status.land') },
  ]

  const [form, setForm] = useState<PropertyFormData>({ ...defaultData, ...initialData })
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrls = useMemo(
    () => form.imageFiles.map((f) => URL.createObjectURL(f)),
    [form.imageFiles],
  )

  useEffect(() => {
    return () => {
      objectUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [objectUrls])

  function update<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Partial<Record<keyof PropertyFormData, string>> = {}
    if (!form.title.trim()) newErrors.title = t('property_form.validation.title_required')
    if (!form.description.trim()) newErrors.description = t('property_form.validation.description_required')
    else if (form.description.trim().length < 10) newErrors.description = t('property_form.validation.description_min_length')
    if (form.price <= 0) newErrors.price = t('property_form.validation.price_positive')
    if (!form.type) newErrors.type = t('property_form.validation.type_required')
    if (!form.dealType) newErrors.dealType = t('property_form.validation.deal_required')
    if (!form.status) newErrors.status = t('property_form.validation.status_required')
    if (!form.address.trim()) newErrors.address = t('property_form.validation.address_required')
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSubmit(form)
  }

  const showFloor = form.type === 'apartment' || form.type === 'commercial'

  function formatPrice(val: string): string {
    const digits = val.replace(/\D/g, '')
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  function parsePrice(val: string): number {
    return Number(val.replace(/\s/g, '')) || 0
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-28 lg:pb-8 space-y-5 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Asosiy ma&apos;lumotlar</h2>

          <FormField label={t('property_form.title_label')} delay={0.05}>
              <input
                type="text" value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder={t('property_form.title_placeholder')}
              />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </FormField>

          <FormField label={t('property_form.description_label')} delay={0.08}>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none min-h-[100px] resize-none"
              placeholder={t('property_form.description_placeholder')}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </FormField>

          <FormField label={t('property_form.price_label')} delay={0.1}>
            <input
              type="text" inputMode="numeric"
              value={form.price ? formatPrice(String(form.price)) : ''}
              onChange={(e) => update('price', parsePrice(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              placeholder={t('property_form.price_placeholder')}
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </FormField>
        </motion.div>

        <div className="border-t border-gray-100" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Turkumlar</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('property_form.type_label')}</label>
              <Select
                value={form.type}
                onChange={(v) => update('type', v)}
                options={propertyTypes}
                placeholder={t('select.placeholder')}
              />
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('property_form.deal_label')}</label>
              <Select
                value={form.dealType}
                onChange={(v) => update('dealType', v)}
                options={dealTypes}
                placeholder={t('select.placeholder')}
              />
              {errors.dealType && <p className="text-xs text-red-500 mt-1">{errors.dealType}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('property_form.status_label')}</label>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update('status', form.status === s.value ? '' : s.value)}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    form.status === s.value
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
          </div>

          {form.dealType === 'installment' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('property_form.installment_months_label')}</label>
              <input
                type="number" min={1} max={120} value={form.installmentMonths || ''}
                onChange={(e) => update('installmentMonths', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="0"
              />
            </motion.div>
          )}
        </motion.div>

        <div className="border-t border-gray-100" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="space-y-4"
        >
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Media va detallar</h2>

          <FormField label={t('property_form.images_label')} delay={0.18}>
            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length === 0) return
                    const errors: string[] = []
                    const valid: File[] = []
                    for (const file of files) {
                      if (file.size > 5 * 1024 * 1024) {
                        errors.push(`"${file.name}" — 5 MB dan katta`)
                      } else {
                        valid.push(file)
                      }
                    }
                    if (errors.length > 0) setFileErrors(errors)
                    update('imageFiles', [...form.imageFiles, ...valid])
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                />
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">{t('property_form.upload_button')}</span>
              </label>
              {fileErrors.length > 0 && (
                <div className="text-xs text-red-500 space-y-0.5">
                  {fileErrors.map((err, i) => <p key={i}>{err}</p>)}
                </div>
              )}
              {form.imageFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {form.imageFiles.map((file, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={objectUrls[i] || ''}
                        alt=""
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...form.imageFiles]
                          updated.splice(i, 1)
                          update('imageFiles', updated)
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField label={t('property_form.area_label')} delay={0.2}>
            <input
              type="number" value={form.area || ''}
              onChange={(e) => update('area', Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              placeholder="0"
            />
            </FormField>
            <FormField label={t('property_form.rooms_label')} delay={0.22}>
              <input
                type="number" min={0} value={form.rooms || ''}
                onChange={(e) => update('rooms', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="0"
              />
            </FormField>
          </div>

          {showFloor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('property_form.floor_label')}</label>
                <input
                  type="number" min={1} value={form.floor || ''}
                  onChange={(e) => update('floor', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('property_form.total_floors_label')}</label>
                <input
                  type="number" min={1} value={form.totalFloors || ''}
                  onChange={(e) => update('totalFloors', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  placeholder="0"
                />
              </div>
            </motion.div>
          )}

          <FormField label={t('property_form.address_label')} delay={0.24}>
            <div className="flex gap-2">
              <div className="flex-1">
              <input
                type="text" value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder={t('property_form.address_placeholder')}
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="px-3 py-2.5 rounded-xl border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
              >
                <Map className="w-4 h-4" />
                Xarita
              </button>
            </div>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField label="Kenglik (lat)" delay={0.26}>
              <input
                type="number" step="0.0001" value={form.lat || ''}
                onChange={(e) => update('lat', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="0"
              />
            </FormField>
            <FormField label="Uzunlik (lng)" delay={0.28}>
              <input
                type="number" step="0.0001" value={form.lng || ''}
                onChange={(e) => update('lng', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="0"
              />
            </FormField>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit" disabled={saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('property_form.saving')}
            </span>
          ) : (
            t('property_form.submit')
          )}
        </motion.button>
      </div>

      {showMapPicker && (
        <MapPicker
          onSelect={(lat, lng) => {
            update('lat', lat)
            update('lng', lng)
            setShowMapPicker(false)
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </form>
  )
}
