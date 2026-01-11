import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/features/auth/actions';
import Link from 'next/link';

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/app" className="text-xl font-bold text-gray-900">
              Collaboration Notes
            </Link>

            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-4">
                <Link
                  href="/app"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Active Items
                </Link>
                <Link
                  href="/app/completed"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Completed
                </Link>
              </nav>

              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <span className="text-sm text-gray-700">
                  {user?.user_metadata?.name || user?.email}
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
