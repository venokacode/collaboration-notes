import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function getActiveOrgId(): Promise<string | null> {
  const cookieStore = await cookies()
  const activeOrgCookie = cookieStore.get('active_org_id')
  return activeOrgCookie?.value || null
}

export async function setActiveOrgId(orgId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('active_org_id', orgId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}

export async function clearActiveOrgId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('active_org_id')
}

export async function getUserOrganizations() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: memberships } = await supabase
    .from('org_members')
    .select('organization_id, role, organizations(id, name)')
    .eq('user_id', user.id)

  if (!memberships) {
    return []
  }

  return memberships.map((m) => ({
    id: m.organization_id,
    name: (m.organizations as any)?.name || 'Unknown',
    role: m.role,
  }))
}

export async function isOrgMember(orgId: string): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('org_members')
    .select('id')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  return !!data
}
