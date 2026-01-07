import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/organization'
import { inviteMember, updateMemberRole, removeMember } from '@/features/organization/actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function MembersPage() {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    redirect('/app/onboarding/org')
  }

  // Get current user's role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentMember } = await supabase
    .from('org_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user?.id)
    .single()

  const canManageMembers = currentMember?.role === 'owner' || currentMember?.role === 'admin'

  // Get all members with user details
  const { data: members, error } = await supabase
    .from('org_members')
    .select(`
      id,
      role,
      joined_at,
      user_settings!inner(
        user_id,
        full_name,
        email
      )
    `)
    .eq('organization_id', orgId)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch members:', error)
    notFound()
  }

  async function handleInvite(formData: FormData) {
    'use server'
    if (orgId) {
      formData.append('org_id', orgId)
    }
    await inviteMember(formData)
  }

  async function handleUpdateRole(formData: FormData) {
    'use server'
    await updateMemberRole(formData)
  }

  async function handleRemove(formData: FormData) {
    'use server'
    const memberId = formData.get('member_id') as string
    await removeMember(memberId)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <p className="text-gray-600 mt-2">
          Manage who has access to your organization
        </p>
      </div>

      <div className="grid gap-6">
        {/* Invite Member */}
        {canManageMembers && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Invite New Member</h2>
            
            <form action={handleInvite} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="colleague@example.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    User must have an account already
                  </p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <Button type="submit">
                Send Invitation
              </Button>
            </form>
          </Card>
        )}

        {/* Members List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Current Members ({members?.length || 0})
          </h2>

          <div className="space-y-4">
            {members?.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {member.user_settings.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.user_settings.full_name}</p>
                      <p className="text-sm text-gray-600">{member.user_settings.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {canManageMembers && member.role !== 'owner' ? (
                    <form action={handleUpdateRole} className="flex items-center gap-2">
                      <input type="hidden" name="member_id" value={member.id} />
                      <select
                        name="role"
                        defaultValue={member.role}
                        onChange={(e) => {
                          const form = e.target.closest('form')
                          if (form) {
                            const formData = new FormData(form)
                            handleUpdateRole(formData)
                          }
                        }}
                        className="px-3 py-1 border rounded-lg text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </form>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium capitalize">
                      {member.role}
                    </span>
                  )}

                  {canManageMembers && member.role !== 'owner' && (
                    <form action={handleRemove}>
                      <input type="hidden" name="member_id" value={member.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}

            {(!members || members.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No members found
              </div>
            )}
          </div>
        </Card>

        {/* Role Descriptions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Role Permissions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Owner</h3>
              <p className="text-sm text-gray-600">
                Full access to all features including organization settings, billing, and member management. 
                Can delete the organization.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Admin</h3>
              <p className="text-sm text-gray-600">
                Can manage members, create and edit tests, view all reports, and manage candidates.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Recruiter</h3>
              <p className="text-sm text-gray-600">
                Can create tests, invite candidates, and view reports. Cannot manage members or organization settings.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Viewer</h3>
              <p className="text-sm text-gray-600">
                Read-only access. Can view tests and reports but cannot create or edit anything.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
