'use client'

import { useI18n, type Locale } from '@/lib/i18n/I18nContext'

const locales: { value: Locale; label: string; short: string }[] = [
  { value: 'uz', label: "O'zbekcha", short: 'UZ' },
  { value: 'ru', label: 'Русский', short: 'RU' },
  { value: 'en', label: 'English', short: 'EN' },
]

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="lang-seg">
      {locales.map((l) => {
        const isActive = l.value === locale
        return (
          <button
            key={l.value}
            onClick={() => setLocale(l.value)}
            className={`lang-seg-item ${isActive ? 'lang-seg-active' : ''}`}
            aria-label={l.label}
          >
            {l.short}
          </button>
        )
      })}

      <style jsx global>{`
        .lang-seg {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 3px;
          border-radius: 10px;
          background: rgba(241, 245, 249, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .lang-seg-item {
          position: relative;
          padding: 4px 10px;
          border-radius: 7px;
          border: none;
          background: transparent;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          line-height: 1.4;
        }

        .lang-seg-item:hover:not(.lang-seg-active) {
          color: #64748b;
          background: rgba(226, 232, 240, 0.5);
        }

        .lang-seg-item:active {
          transform: scale(0.95);
        }

        .lang-seg-active {
          background: white;
          color: #185FA5;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 1px 2px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  )
}
