import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HR SaaS - Modern HR Assessment Platform',
  description: 'Streamline your hiring process with AI-powered assessments',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
