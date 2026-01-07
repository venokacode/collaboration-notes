import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isValidUUID, checkRateLimit } from '@/lib/security'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing required Supabase environment variables')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /app/* routes
  if (pathname.startsWith('/app')) {
    // Check authentication
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Skip org check for onboarding routes
    if (!pathname.startsWith('/app/onboarding')) {
      // Check organization context
      const activeOrgId = request.cookies.get('active_org_id')?.value

      if (!activeOrgId) {
        return NextResponse.redirect(new URL('/app/onboarding/org', request.url))
      }

      // Validate UUID format to prevent enumeration attacks
      if (!isValidUUID(activeOrgId)) {
        console.warn(`Invalid org ID format: ${activeOrgId}`)
        response = NextResponse.redirect(new URL('/app/onboarding/org', request.url))
        response.cookies.delete('active_org_id')
        return response
      }

      // Rate limiting for org verification (per user)
      const rateLimitKey = `org-verify:${user.id}`
      const rateLimit = checkRateLimit(rateLimitKey, 20, 60000) // 20 requests per minute

      if (!rateLimit.allowed) {
        console.warn(`Rate limit exceeded for user ${user.id}`)
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }

      // Verify user is a member of the active organization
      // Note: This query is protected by RLS, so it will only return results
      // if the user is actually a member
      const { data: membership, error } = await supabase
        .from('org_members')
        .select('id')
        .eq('organization_id', activeOrgId)
        .eq('user_id', user.id)
        .single()

      if (error || !membership) {
        // Log suspicious activity (potential enumeration attempt)
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned"
          console.error('Org membership verification error:', error)
        }

        // Clear invalid org cookie and redirect to onboarding
        response = NextResponse.redirect(new URL('/app/onboarding/org', request.url))
        response.cookies.delete('active_org_id')
        return response
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
