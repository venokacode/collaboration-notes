'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { locales, localeNames, type Locale } from '@/lib/i18n/config'

interface LocaleSwitcherProps {
  currentLocale: Locale
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(newLocale: Locale) {
    startTransition(() => {
      // Set cookie
      document.cookie = `ui_locale=${newLocale}; path=/; max-age=31536000`
      // Refresh to apply new locale
      router.refresh()
    })
  }

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value as Locale)}
      disabled={isPending}
      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {localeNames[locale]}
        </option>
      ))}
    </select>
  )
}
