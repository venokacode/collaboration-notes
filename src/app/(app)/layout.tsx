import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - HR SaaS',
  description: 'Manage your HR assessments',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
