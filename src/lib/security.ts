import { z } from 'zod'

// UUID v4 validation schema
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Validate UUID format
export function isValidUUID(value: string): boolean {
  return uuidSchema.safeParse(value).success
}

// Rate limiting cache (in-memory, for demonstration)
// In production, use Redis or similar
const rateLimitCache = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitCache.get(key)

  // Clean up expired entries
  if (record && now > record.resetAt) {
    rateLimitCache.delete(key)
  }

  const current = rateLimitCache.get(key)

  if (!current) {
    rateLimitCache.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  if (current.count >= maxAttempts) {
    return { allowed: false, remaining: 0 }
  }

  current.count++
  return { allowed: true, remaining: maxAttempts - current.count }
}

// Clean up rate limit cache periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitCache.entries()) {
      if (now > record.resetAt) {
        rateLimitCache.delete(key)
      }
    }
  }, 60000) // Clean up every minute
}
