import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID } from '@/lib/security'

// Type definitions for organization data
export interface Organization {
  id: string
  name: string
}

export interface OrganizationMembership {
  organization_id: string
  role: string
  organizations: Organization | Organization[] | null
}

export interface UserOrganization {
  id: string
  name: string
  role: string
}

export async function getActiveOrgId(): Promise<string | null> {
  const cookieStore = await cookies()
  const activeOrgCookie = cookieStore.get('active_org_id')
  const orgId = activeOrgCookie?.value || null

  // Validate UUID format
  if (orgId && !isValidUUID(orgId)) {
    console.warn(`Invalid org ID format in cookie: ${orgId}`)
    await clearActiveOrgId()
    return null
  }

  return orgId
}

export async function setActiveOrgId(orgId: string): Promise<void> {
  // Validate UUID format before setting
  if (!isValidUUID(orgId)) {
    throw new Error('Invalid organization ID format')
  }

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

export async function getUserOrganizations(): Promise<UserOrganization[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Failed to get user:', authError)
      return []
    }

    const { data: memberships, error: queryError } = await supabase
      .from('org_members')
      .select('organization_id, role, organizations(id, name)')
      .eq('user_id', user.id)
      .returns<OrganizationMembership[]>()

    if (queryError) {
      console.error('Failed to fetch user organizations:', queryError)
      return []
    }

    if (!memberships) {
      return []
    }

    // Type-safe mapping with proper null checks
    return memberships
      .map((m): UserOrganization | null => {
        // Handle the case where organizations might be an array or null
        const org = Array.isArray(m.organizations)
          ? m.organizations[0]
          : m.organizations

        if (!org || !org.id || !org.name) {
          console.warn(
            `Invalid organization data for membership ${m.organization_id}`
          )
          return null
        }

        return {
          id: m.organization_id,
          name: org.name,
          role: m.role,
        }
      })
      .filter((org): org is UserOrganization => org !== null)
  } catch (error) {
    console.error('Unexpected error in getUserOrganizations:', error)
    return []
  }
}

export async function isOrgMember(orgId: string): Promise<boolean> {
  // Validate UUID format
  if (!isValidUUID(orgId)) {
    console.warn(`Invalid org ID format: ${orgId}`)
    return false
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return false
    }

    const { data, error: queryError } = await supabase
      .from('org_members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (queryError) {
      // Only log if it's not a "no rows" error
      if (queryError.code !== 'PGRST116') {
        console.error('Failed to check org membership:', queryError)
      }
      return false
    }

    return !!data
  } catch (error) {
    console.error('Unexpected error in isOrgMember:', error)
    return false
  }
}
