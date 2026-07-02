'use client'

import { useState, useEffect, useCallback, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiAdminProperties, apiAdminDeleteProperty, apiAdminToggleFeatured, isAdminLoggedIn } from '@/services/admin'
import { useI18n } from '@/lib/i18n/I18nContext'
import Select from '@/components/ui/Select'

const dealLabels: Record<string, string> = { daily: 'Kunlik', sale: 'Sotiladi', rent: 'Ijara', installment: 'Nasiya' }
const typeLabels: Record<string, string> = { apartment: 'Kvartira', house: 'Hovli', cottage: 'Kottej', dacha: 'Dacha', commercial: 'Tijorat', land: 'Yer' }
const statusLabels: Record<string, string> = { ready: 'Tayyor', 'half-ready': 'Yarim tayyor', land: 'Tekis yer', sold: 'Sotilgan' }

export default function AdminProperties() {
  const router = useRouter()
  const { t } = useI18n()
  const [properties, setProperties] = useState<Record<string, unknown>[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    try {
      const res = await apiAdminProperties(page, 20, filters)
      setProperties(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch { router.replace('/admin') }
  }, [page, filters, router])

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/admin'); return }
    startTransition(() => load())
  }, [load, router])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" — e'lonni o'chirishni tasdiqlaysizmi?`)) return
    try {
      await apiAdminDeleteProperty(id)
      load()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Xatolik') }
  }

  async function handleToggleFeatured(id: string) {
    try {
      await apiAdminToggleFeatured(id)
      load()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Xatolik') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('admin.properties.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Jami: {total}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.dealType || ''}
          onChange={v => { setFilters(f => ({ ...f, dealType: v })); setPage(1) }}
          options={Object.entries(dealLabels).map(([value, label]) => ({ value, label }))}
          placeholder={t('admin.properties.filter_all')}
          size="sm"
          className="w-auto min-w-[120px]"
        />
        <Select
          value={filters.type || ''}
          onChange={v => { setFilters(f => ({ ...f, type: v })); setPage(1) }}
          options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))}
          placeholder={t('admin.properties.filter_all')}
          size="sm"
          className="w-auto min-w-[100px]"
        />
        <Select
          value={filters.status || ''}
          onChange={v => { setFilters(f => ({ ...f, status: v })); setPage(1) }}
          options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
          placeholder={t('admin.properties.filter_all')}
          size="sm"
          className="w-auto min-w-[110px]"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">{t('admin.properties.title_col')}</th>
                <th className="px-4 py-3">{t('admin.properties.price')}</th>
                <th className="px-4 py-3">{t('admin.properties.type')}</th>
                <th className="px-4 py-3">{t('admin.properties.deal')}</th>
                <th className="px-4 py-3">{t('admin.properties.status')}</th>
                <th className="px-4 py-3">{t('admin.properties.featured')}</th>
                <th className="px-4 py-3">{t('admin.properties.address')}</th>
                <th className="px-4 py-3">{t('admin.properties.created')}</th>
                <th className="px-4 py-3 text-right">{t('admin.properties.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties.map(p => (
                <tr key={String(p.id || p._id || '')} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{String(p.title || '-')}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">${Number(p.price || 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium">{typeLabels[String(p.type || '')] || String(p.type || '-')}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[11px] font-medium">{dealLabels[String(p.dealType || '')] || String(p.dealType || '-')}</span></td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${p.status === 'sold' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[String(p.status || '')] || String(p.status || '-')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleFeatured(String(p.id || p._id || ''))}
                      className={`p-1.5 rounded-lg transition-all ${p.featured ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-gray-400'}`}
                      title={p.featured ? t('admin.properties.featured_remove') : t('admin.properties.featured_add')}
                    >
                      <Star className="w-4 h-4" fill={p.featured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[150px] truncate">
                    {String((p.location as Record<string, unknown>)?.address || '-')}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{String(p.createdAt || '').slice(0, 10) || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(String(p.id || p._id || ''), String(p.title || ''))}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">{t('admin.properties.not_found')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
