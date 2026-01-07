import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user settings
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  async function handleUpdate(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const fullName = formData.get('full_name') as string

    await supabase
      .from('user_settings')
      .update({
        full_name: fullName,
      })
      .eq('user_id', user.id)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          
          <form action={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                defaultValue={settings?.full_name || ''}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                Email address cannot be changed
              </p>
            </div>

            <div>
              <label htmlFor="user_id" className="block text-sm font-medium mb-2">
                User ID
              </label>
              <input
                type="text"
                id="user_id"
                value={user.id}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                This ID is used for API integrations
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Account Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Account Created
              </label>
              <input
                type="text"
                value={new Date(user.created_at).toLocaleDateString()}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Sign In
              </label>
              <input
                type="text"
                value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="locale" className="block text-sm font-medium mb-2">
                Language
              </label>
              <select
                id="locale"
                name="locale"
                defaultValue={settings?.locale || 'en'}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div className="pt-4">
              <Button type="button" variant="outline">
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Password</h3>
              <p className="text-sm text-gray-600 mb-4">
                Change your password to keep your account secure
              </p>
              <Button variant="outline">
                Change Password
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
