'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { apiAdminProperties, apiAdminDeleteProperty, isAdminLoggedIn } from '@/lib/admin'

const dealLabels: Record<string, string> = { daily: 'Kunlik', sale: 'Sotiladi', rent: 'Ijara', installment: 'Nasiya' }
const typeLabels: Record<string, string> = { apartment: 'Kvartira', house: 'Hovli', cottage: 'Kottej', dacha: 'Dacha', commercial: 'Tijorat', land: 'Yer' }
const statusLabels: Record<string, string> = { ready: 'Tayyor', 'half-ready': 'Yarim tayyor', land: 'Tekis yer', sold: 'Sotilgan' }

export default function AdminProperties() {
  const router = useRouter()
  const [properties, setProperties] = useState<Record<string, unknown>[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/admin'); return }
    load()
  }, [page, filters])

  async function load() {
    setLoading(true)
    try {
      const res = await apiAdminProperties(page, 20, filters)
      setProperties(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch { router.replace('/admin') }
    setLoading(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" — e'lonni o'chirishni tasdiqlaysizmi?`)) return
    try {
      await apiAdminDeleteProperty(id)
      load()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Xatolik') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">E'lonlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Jami: {total}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={filters.dealType || ''} onChange={e => { setFilters(f => ({ ...f, dealType: e.target.value })); setPage(1) }}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:border-blue-400 outline-none">
          <option value="">Barcha bitim</option>
          {Object.entries(dealLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.type || ''} onChange={e => { setFilters(f => ({ ...f, type: e.target.value })); setPage(1) }}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:border-blue-400 outline-none">
          <option value="">Barcha tur</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.status || ''} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:border-blue-400 outline-none">
          <option value="">Barcha holat</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Sarlavha</th>
                <th className="px-4 py-3">Narx</th>
                <th className="px-4 py-3">Tur</th>
                <th className="px-4 py-3">Bitim</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3">Manzil</th>
                <th className="px-4 py-3">Yaratilgan</th>
                <th className="px-4 py-3 text-right">Amal</th>
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
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[150px] truncate">
                    {String((p.location as Record<string, unknown>)?.address || (p as any).address || '-')}
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
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">E'lonlar topilmadi</td></tr>
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
