import { OrgSwitcher } from '@/components/layout/OrgSwitcher'
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher'
import { getUserOrganizations, getActiveOrgId } from '@/lib/organization'
import { getLocale } from '@/lib/i18n/getLocale'
import Link from 'next/link'

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizations = await getUserOrganizations()
  const activeOrgId = await getActiveOrgId()
  const currentLocale = await getLocale()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/app" className="text-xl font-bold text-gray-900">
              HR SaaS
            </Link>

            <div className="flex items-center gap-4">
              {activeOrgId && (
                <OrgSwitcher
                  organizations={organizations}
                  currentOrgId={activeOrgId}
                />
              )}
              <LocaleSwitcher currentLocale={currentLocale} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
