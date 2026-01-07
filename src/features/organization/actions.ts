'use server'

import { createClient } from '@/lib/supabase/server'
import { setActiveOrgId } from '@/lib/organization'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createOrgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
})

export type OrgResult = {
  success: boolean
  error?: string
  orgId?: string
}

export async function createOrganization(formData: FormData): Promise<OrgResult> {
  try {
    const rawData = {
      name: formData.get('name'),
    }

    // Validate input
    const validation = createOrgSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      }
    }

    const { name } = validation.data

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to create an organization',
      }
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
      })
      .select()
      .single()

    if (orgError || !org) {
      console.error('Failed to create organization:', orgError)
      return {
        success: false,
        error: 'Failed to create organization',
      }
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('org_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      console.error('Failed to add user as owner:', memberError)
      // Try to clean up the organization
      await supabase.from('organizations').delete().eq('id', org.id)
      return {
        success: false,
        error: 'Failed to set up organization membership',
      }
    }

    // Set as active organization
    await setActiveOrgId(org.id)

    return {
      success: true,
      orgId: org.id,
    }
  } catch (error) {
    console.error('Unexpected error creating organization:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

export async function updateOrganization(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const orgId = formData.get('org_id') as string
    const name = formData.get('name') as string

    if (!name || name.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' }
    }

    const { error } = await supabase
      .from('organizations')
      .update({ name })
      .eq('id', orgId)

    if (error) {
      console.error('Failed to update organization:', error)
      return { success: false, error: 'Failed to update organization' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function inviteMember(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const orgId = formData.get('org_id') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as 'admin' | 'recruiter' | 'viewer'

    // Find user by email
    const { data: targetUser } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('email', email)
      .single()

    if (!targetUser) {
      return { success: false, error: 'User not found' }
    }

    // Check if already member
    const { data: existing } = await supabase
      .from('org_members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('user_id', targetUser.user_id)
      .single()

    if (existing) {
      return { success: false, error: 'User is already a member' }
    }

    // Add member
    const { error } = await supabase
      .from('org_members')
      .insert({
        organization_id: orgId,
        user_id: targetUser.user_id,
        role,
      })

    if (error) {
      console.error('Failed to add member:', error)
      return { success: false, error: 'Failed to add member' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateMemberRole(formData: FormData) {
  try {
    const supabase = await createClient()
    const memberId = formData.get('member_id') as string
    const role = formData.get('role') as 'admin' | 'recruiter' | 'viewer'

    const { error } = await supabase
      .from('org_members')
      .update({ role })
      .eq('id', memberId)

    if (error) {
      console.error('Failed to update role:', error)
      return { success: false, error: 'Failed to update role' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function removeMember(memberId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('org_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      console.error('Failed to remove member:', error)
      return { success: false, error: 'Failed to remove member' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function switchOrganization(orgId: string) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in',
      }
    }

    // Verify user is a member
    const { data: membership, error: memberError } = await supabase
      .from('org_members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return {
        success: false,
        error: 'You are not a member of this organization',
      }
    }

    // Set as active organization
    await setActiveOrgId(orgId)

    return { success: true }
  } catch (error) {
    console.error('Unexpected error switching organization:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
