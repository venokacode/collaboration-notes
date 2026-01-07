import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { defaultLocale, type Locale, locales } from './config'

export async function getLocale(): Promise<Locale> {
  // 1. Check user settings in database
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('locale')
        .eq('user_id', user.id)
        .single()

      if (settings?.locale && locales.includes(settings.locale as Locale)) {
        return settings.locale as Locale
      }
    }
  } catch (error) {
    // If database query fails, continue to next fallback
    console.error('Failed to get locale from database:', error)
  }

  // 2. Check cookie
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('ui_locale')
  if (localeCookie?.value && locales.includes(localeCookie.value as Locale)) {
    return localeCookie.value as Locale
  }

  // 3. TODO: Check browser Accept-Language header
  // This would require accessing headers() and parsing Accept-Language

  // 4. Default to English
  return defaultLocale
}
