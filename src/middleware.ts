import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
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

      // Verify user is a member of the active organization
      const { data: membership } = await supabase
        .from('org_members')
        .select('id')
        .eq('organization_id', activeOrgId)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
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
