import Link from 'next/link'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-8">
      {/* Sidebar Navigation */}
      <aside className="space-y-2">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <nav className="space-y-1">
          <Link
            href="/app/settings/profile"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/app/settings/organization"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Organization
          </Link>
          <Link
            href="/app/settings/members"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Team Members
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div>{children}</div>
    </div>
  )
}
