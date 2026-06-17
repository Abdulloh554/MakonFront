'use client'

import { useState, useEffect, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiAdminSellers, apiAdminDeleteSeller, isAdminLoggedIn } from '@/services/admin'

export default function AdminSellers() {
  const router = useRouter()
  const [sellers, setSellers] = useState<Record<string, unknown>[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiAdminSellers(page, 20)
      setSellers(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch { router.replace('/admin') }
    setLoading(false)
  }

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/admin'); return }
    startTransition(() => load())
  }, [page])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" — sotuvchini o'chirishni tasdiqlaysizmi?`)) return
    try {
      await apiAdminDeleteSeller(id)
      load()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Xatolik') }
  }

  if (loading) return <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Sotuvchilar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Jami: {total}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Nomi</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Reyting</th>
                <th className="px-4 py-3">E&apos;lonlar</th>
                <th className="px-4 py-3">Qo&apos;shilgan</th>
                <th className="px-4 py-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sellers.map(s => (
                <tr key={String(s.id || s._id || '')} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(String(s.name || 'S')[0])}
                      </div>
                      <span className="font-medium text-gray-900 truncate">{String(s.name || '-')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{String(s.phone || '-')}</td>
                  <td className="px-4 py-3">
                    <span className="text-amber-500 text-xs">{'★'.repeat(Math.round(Number(s.rating) || 0))}</span>
                    <span className="text-gray-300 text-xs">{'★'.repeat(5 - Math.round(Number(s.rating) || 0))}</span>
                    <span className="text-gray-500 text-[11px] ml-1">({String(s.rating || '0')})</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{String(s.totalListings || '0')}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{String(s.joinedAt || '').slice(0, 10) || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(String(s.id || s._id || ''), String(s.name || ''))}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {sellers.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Sotuvchilar topilmadi</td></tr>
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
