import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/organization'
import { updateOrganization } from '@/features/organization/actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function OrganizationSettingsPage() {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    redirect('/app/onboarding/org')
  }

  // Get organization details
  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (error || !org) {
    notFound()
  }

  // Get current user's role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('org_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user?.id)
    .single()

  const canEdit = member?.role === 'owner' || member?.role === 'admin'

  async function handleUpdate(formData: FormData) {
    'use server'
    if (orgId) {
      formData.append('org_id', orgId)
    }
    await updateOrganization(formData)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your organization details and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <form action={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Organization Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={org.name}
                disabled={!canEdit}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Organization ID
              </label>
              <input
                type="text"
                value={org.id}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                This ID is used for API integrations and cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Created
              </label>
              <input
                type="text"
                value={new Date(org.created_at).toLocaleDateString()}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {canEdit && (
              <div className="pt-4">
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Danger Zone */}
        {member?.role === 'owner' && (
          <Card className="p-6 border-red-200">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Danger Zone
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Delete Organization</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete an organization, there is no going back. 
                  This will permanently delete all data including tests, candidates, and reports.
                </p>
                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                  Delete Organization
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
