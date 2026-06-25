import Link from 'next/link'
import { Home, SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 flex items-center justify-center">
          <SearchX className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Sahifa topilmadi
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Qidirilayotgan sahifa mavjud emas yoki olib tashlangan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  )
}
