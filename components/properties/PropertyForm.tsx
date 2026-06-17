'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import FormField from '@/components/ui/FormField'
import { Map, Upload, X } from 'lucide-react'

const MapPicker = dynamic(() => import('@/components/features/map/MapPicker'), { ssr: false })

const propertyTypes = [
  { value: 'apartment', label: 'Kvartira' },
  { value: 'house', label: 'Hovli' },
  { value: 'cottage', label: 'Kottej' },
  { value: 'dacha', label: 'Dacha' },
  { value: 'commercial', label: 'Tijorat' },
  { value: 'land', label: 'Yer' },
]

const dealTypes = [
  { value: 'daily', label: 'Kunlik' },
  { value: 'sale', label: 'Sotiladi' },
  { value: 'rent', label: 'Ijara' },
  { value: 'installment', label: 'Nasiya' },
]

const statuses = [
  { value: 'ready', label: 'Tayyor' },
  { value: 'half-ready', label: 'Yarim tayyor' },
  { value: 'land', label: 'Tekis yer' },
]

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
  type: 'apartment', dealType: 'sale', status: 'ready',
  imageFiles: [], area: 50, rooms: 2,
  floor: 1, totalFloors: 5, installmentMonths: 12,
  address: '', lat: 41.3111, lng: 69.2797,
}

export default function PropertyForm({ initialData, onSubmit, saving = false }: PropertyFormProps) {
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
    if (!form.title.trim()) newErrors.title = 'Sarlavha majburiy'
    if (!form.description.trim()) newErrors.description = 'Tavsif majburiy'
    else if (form.description.trim().length < 10) newErrors.description = 'Tavsif kamida 10 ta belgidan iborat bo\'lishi kerak'
    if (form.price <= 0) newErrors.price = 'Narx musbat son bo\'lishi kerak'
    if (!form.address.trim()) newErrors.address = 'Manzil majburiy'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSubmit(form)
  }

  const showFloor = form.type === 'apartment' || form.type === 'commercial'

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

          <FormField label="Sarlavha" delay={0.05}>
              <input
                type="text" value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="Masalan: 3 xonali kvartira"
              />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </FormField>

          <FormField label="Tavsif" delay={0.08}>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none min-h-[100px] resize-none"
              placeholder="Batafsil ma'lumot (kamida 10 belgi)"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </FormField>

          <FormField label="Narx ($)" delay={0.1}>
            <input
              type="number" value={form.price}
              onChange={(e) => update('price', Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              placeholder="0"
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
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mulk turi</label>
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none outline-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                {propertyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Bitim turi</label>
              <select
                value={form.dealType}
                onChange={(e) => update('dealType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none outline-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                {dealTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Holati</label>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update('status', s.value)}
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
          </div>

          {form.dealType === 'installment' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nechi oyga?</label>
              <input
                type="number" min={1} max={120} value={form.installmentMonths}
                onChange={(e) => update('installmentMonths', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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

          <FormField label="Rasmlar" delay={0.18}>
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
                <span className="text-sm text-gray-500">Rasm qo&apos;shish</span>
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
          <FormField label="Maydon (m²)" delay={0.2}>
            <input
              type="number" value={form.area}
              onChange={(e) => update('area', Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
            </FormField>
            <FormField label="Xonalar" delay={0.22}>
              <input
                type="number" min={0} value={form.rooms}
                onChange={(e) => update('rooms', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Qavat</label>
                <input
                  type="number" min={1} value={form.floor}
                  onChange={(e) => update('floor', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Qavatlar soni</label>
                <input
                  type="number" min={1} value={form.totalFloors}
                  onChange={(e) => update('totalFloors', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
            </motion.div>
          )}

          <FormField label="Manzil" delay={0.24}>
            <div className="flex gap-2">
              <div className="flex-1">
              <input
                type="text" value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="Toshkent, Chilonzor tumani"
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!form.address.trim()) return
                  try {
                    const res = await fetch(
                      'https://nominatim.openstreetmap.org/search?format=json&q=' +
                      encodeURIComponent(form.address + ', Uzbekistan') +
                      '&limit=1'
                    )
                    const data = await res.json()
                    if (data.length > 0) {
                      update('lat', parseFloat(data[0].lat))
                      update('lng', parseFloat(data[0].lon))
                    }
                  } catch {}
                }}
                className="px-3 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shrink-0"
              >
                Topish
              </button>
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
                type="number" step="0.0001" value={form.lat}
                onChange={(e) => update('lat', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
            </FormField>
            <FormField label="Uzunlik (lng)" delay={0.28}>
              <input
                type="number" step="0.0001" value={form.lng}
                onChange={(e) => update('lng', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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
              Saqlanmoqda...
            </span>
          ) : (
            'Elonni joylash'
          )}
        </motion.button>
      </div>

      {showMapPicker && (
        <MapPicker
          initialLat={form.lat}
          initialLng={form.lng}
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
