'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { apiAdminMessages, isAdminLoggedIn } from '@/lib/admin'

export default function AdminMessages() {
  const router = useRouter()
  const [messages, setMessages] = useState<Record<string, unknown>[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/admin'); return }
    load()
  }, [page])

  async function load() {
    setLoading(true)
    try {
      const res = await apiAdminMessages(page, 20)
      setMessages(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch { router.replace('/admin') }
    setLoading(false)
  }

  if (loading) return <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Xabarlar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Jami: {total}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Kimdan</th>
                <th className="px-4 py-3">Kimga</th>
                <th className="px-4 py-3">Xabar</th>
                <th className="px-4 py-3">O'qilgan</th>
                <th className="px-4 py-3">Vaqti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {messages.map(m => (
                <tr key={String(m.id || m._id || '')} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-900 font-mono text-xs">{String(m.fromUserId || '-').slice(0, 20)}</td>
                  <td className="px-4 py-3 text-gray-900 font-mono text-xs">{String(m.toUserId || '-').slice(0, 20)}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[300px] truncate">{String(m.text || '-')}</td>
                  <td className="px-4 py-3">
                    {m.read ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[11px] font-medium">O'qilgan</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-medium">Yangi</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{String(m.createdAt || '').slice(0, 16).replace('T', ' ') || '-'}</td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Xabarlar topilmadi</td></tr>
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
