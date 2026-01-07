import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await request.json()

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a member of the organization
    const { data: membership } = await supabase
      .from('org_members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Set active org cookie
    const cookieStore = await cookies()
    cookieStore.set('active_org_id', orgId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error switching organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
