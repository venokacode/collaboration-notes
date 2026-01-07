import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { uuidSchema } from '@/lib/security'

// Request body schema
const switchOrgSchema = z.object({
  orgId: uuidSchema,
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const validation = switchOrgSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { orgId } = validation.data

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a member of the organization
    const { data: membership, error: membershipError } = await supabase
      .from('org_members')
      .select('id, role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      // Log potential security issue
      console.warn(
        `User ${user.id} attempted to switch to unauthorized org ${orgId}`
      )
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
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

    return NextResponse.json({
      success: true,
      orgId,
      role: membership.role,
    })
  } catch (error) {
    console.error('Error switching organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
