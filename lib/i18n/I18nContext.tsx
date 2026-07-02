'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

export type Locale = 'uz' | 'ru' | 'en'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'maskan-locale'

function loadLocale(): Locale {
  if (typeof window === 'undefined') return 'uz'
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (stored && ['uz', 'ru', 'en'].includes(stored)) return stored
  const browserLang = navigator.language?.slice(0, 2)
  if (browserLang === 'ru') return 'ru'
  if (browserLang === 'en') return 'en'
  return 'uz'
}

let loadedTranslations: Record<string, Record<string, string>> | null = null

async function loadAllTranslations(): Promise<Record<string, Record<string, string>>> {
  if (loadedTranslations) return loadedTranslations
  const [uz, ru, en] = await Promise.all([
    import('./translations/uz.json').then(m => m.default || m),
    import('./translations/ru.json').then(m => m.default || m),
    import('./translations/en.json').then(m => m.default || m),
  ])
  loadedTranslations = { uz, ru, en }
  return loadedTranslations!
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('uz')
  const [loaded, setLoaded] = useState(false)
  const translationsRef = useRef<Record<string, Record<string, string>> | null>(null)

  useEffect(() => {
    loadAllTranslations().then((t) => {
      translationsRef.current = t
      setLocaleState(loadLocale())
      setLoaded(true)
    })
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
    document.documentElement.lang = l
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translations = translationsRef.current
    if (!translations) return key
    const dict = translations[locale]
    if (!dict) return key
    let val = dict[key]
    if (val === undefined) {
      const fallback = translations['uz']?.[key]
      if (fallback !== undefined) val = fallback
      else return key
    }
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.replace(`{${k}}`, String(v))
      }
    }
    return val
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
