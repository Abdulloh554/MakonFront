'use client'

import { useState, useEffect, useCallback, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ChevronLeft, ChevronRight, Search, Shield, User } from 'lucide-react'
import { apiAdminUsers, apiAdminDeleteUser, isAdminLoggedIn } from '@/services/admin'
import { useI18n } from '@/lib/i18n/I18nContext'

export default function AdminUsers() {
  const router = useRouter()
  const { t } = useI18n()
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await apiAdminUsers(page, 20)
      setUsers(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch { router.replace('/admin') }
  }, [page, router])

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/admin'); return }
    startTransition(() => load())
  }, [load, router])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${name} — foydalanuvchini o'chirishni tasdiqlaysizmi?`)) return
    try {
      await apiAdminDeleteUser(id)
      load()
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Xatolik') }
  }

  const filtered = search.trim() ? users.filter(u =>
    String(u.phone || '').toLowerCase().includes(search.toLowerCase()) ||
    String(u.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(u.lastName || '').toLowerCase().includes(search.toLowerCase())
  ) : users

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('admin.users.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Jami: {total}</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
          placeholder={t('admin.users.search')} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">{t('admin.users.name')}</th>
                <th className="px-4 py-3">{t('admin.users.phone')}</th>
                <th className="px-4 py-3">{t('admin.users.role')}</th>
                <th className="px-4 py-3">{t('admin.users.registered')}</th>
                <th className="px-4 py-3 text-right">{t('admin.users.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={String(u.id || u._id || '')} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(String(u.firstName || 'U')[0])}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{String(u.firstName || '')} {String(u.lastName || '')}</p>
                        <p className="text-[11px] text-gray-400">{String(u.email || '')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{String(u.phone || '-')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {u.role === 'admin' ? t('admin.users.role_admin') : u.role === 'seller' ? t('admin.users.role_seller') : t('admin.users.role_user')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{String(u.createdAt || '').slice(0, 10) || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDelete(String(u.id || u._id || ''), String(u.firstName || ''))}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">{t('admin.users.not_found')}</td></tr>
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
