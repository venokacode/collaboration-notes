import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isValidUUID, checkRateLimit } from '@/lib/security'

export async function middleware(request: NextRequest) {
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

    // For collaboration-notes, check workspace membership
    const activeWorkspaceId = request.cookies.get('active_workspace_id')?.value

    if (!activeWorkspaceId) {
      // Get default workspace through workspace_members to respect RLS
      const { data: membership } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces!inner(id, is_default)')
        .eq('user_id', user.id)
        .eq('workspaces.is_default', true)
        .single()

      if (membership?.workspace_id) {
        response = NextResponse.next({
          request,
        })
        response.cookies.set('active_workspace_id', membership.workspace_id, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
        return response
      } else {
        // No default workspace membership found - this shouldn't happen
        // Log error and redirect to login to prevent infinite loop
        console.error('User has no default workspace membership:', user.id)
        return NextResponse.redirect(new URL('/login?error=no_workspace', request.url))
      }
    }

    // Validate UUID format to prevent enumeration attacks
    if (!isValidUUID(activeWorkspaceId)) {
      console.warn(`Invalid workspace ID format: ${activeWorkspaceId}`)
      response = NextResponse.next({ request })
      response.cookies.delete('active_workspace_id')
      return response
    }

    // Rate limiting for workspace verification (per user)
    const rateLimitKey = `workspace-verify:${user.id}`
    const rateLimit = checkRateLimit(rateLimitKey, 20, 60000) // 20 requests per minute

    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for user ${user.id}`)
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Verify user is a member of the active workspace
    const { data: membership, error } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', activeWorkspaceId)
      .eq('user_id', user.id)
      .single()

    if (error || !membership) {
      // Log suspicious activity
      if (error && error.code !== 'PGRST116') {
        console.error('Workspace membership verification error:', error)
      }

      // Clear invalid workspace cookie
      response = NextResponse.next({ request })
      response.cookies.delete('active_workspace_id')
      return response
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
