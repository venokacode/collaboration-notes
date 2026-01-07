import { createBrowserClient } from '@supabase/ssr'

// Validate environment variables on client side
function getClientEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  return { url, key }
}

export function createClient() {
  const { url, key } = getClientEnv()
  return createBrowserClient(url, key)
}
