import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Maximize, BedDouble, Layers, Calendar, Phone, MessageCircle, Star, Building2, ChevronRight } from 'lucide-react'
import type { Property } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const res = await fetch(`${baseUrl}/api/v1/properties/${id}`, {
      next: { revalidate: 120 },
    })
    if (!res.ok) return null
    const body = await res.json()
    return body.success ? (body.data as Property) : null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const property = await fetchProperty(id)
  if (!property) {
    return { title: 'Elon topilmadi — Maskan' }
  }
  return {
    title: `${property.title} — Maskan`,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.images[0] ? [{ url: property.images[0] }] : [],
    },
  }
}

const DEAL_TYPE_LABELS: Record<string, string> = {
  sale: 'Sotiladi', rent: 'Ijaraga', daily: 'Kunlik', installment: 'Bo\'lib to\'lov',
}
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Kvartira', house: 'Uy', cottage: 'Kottej', dacha: 'Dacha', commercial: 'Tijorat', land: 'Yer',
}
const STATUS_LABELS: Record<string, string> = {
  ready: 'Tayyor', 'half-ready': 'Yarim tayyor', land: 'Tekis yer',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('uz-UZ').format(price)
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params
  const property = await fetchProperty(id)
  if (!property) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Image gallery */}
      <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-100 mb-6">
        <Image
          src={property.images[0] || '/placeholder.svg'}
          alt={property.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4">
          <p className="text-3xl font-black text-white drop-shadow-lg">
            {formatPrice(property.price)}$
          </p>
          {property.dealType === 'installment' && property.installmentMonths && (
            <p className="text-sm text-white/80 font-medium">
              oyiga {formatPrice(property.installmentPrice || 0)}$ / {property.installmentMonths} oy
            </p>
          )}
        </div>
      </div>

      {/* Title + badges */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{property.title}</h1>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {DEAL_TYPE_LABELS[property.dealType]}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            {STATUS_LABELS[property.status]}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Building2 className="w-3 h-3" />
            {PROPERTY_TYPE_LABELS[property.type]}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <InfoCard icon={<Maximize className="w-4 h-4" />} label={`${property.area} m²`} />
        {property.rooms > 0 && <InfoCard icon={<BedDouble className="w-4 h-4" />} label={`${property.rooms} xona`} />}
        {property.floor !== undefined && property.totalFloors && (
          <InfoCard icon={<Layers className="w-4 h-4" />} label={`${property.floor}/${property.totalFloors} qavat`} />
        )}
        <InfoCard icon={<MapPin className="w-4 h-4" />} label={property.location.address} fullWidth />
        <InfoCard icon={<Calendar className="w-4 h-4" />} label={new Date(property.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })} fullWidth />
      </div>

      {/* Description */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 mb-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tavsif</h4>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
      </div>

      {/* Seller info */}
      <div className="rounded-xl border border-slate-200 mb-6">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sotuvchi</h4>
        </div>
        <Link
          href={`/sellers/${property.sellerId}`}
          className="flex items-center gap-3.5 p-4 hover:bg-blue-50/50 transition-colors group"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base bg-gradient-to-br from-blue-600 to-blue-400 shrink-0">
            {property.title.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Sotuvchi
            </p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0" />
        </Link>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <a
          href={`tel:${property.sellerId}`}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
        >
          <Phone className="w-4 h-4" />
          Qo&apos;ng&apos;iroq qilish
        </a>
        <Link
          href={`/messages?property=${property.id}`}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm border-2 border-blue-600 text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          Xabar yozish
        </Link>
      </div>
    </div>
  )
}

function InfoCard({ icon, label, fullWidth }: { icon: React.ReactNode; label: string; fullWidth?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 ${fullWidth ? 'col-span-2 md:col-span-3' : ''}`}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-500">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700 truncate">{label}</span>
    </div>
  )
}
