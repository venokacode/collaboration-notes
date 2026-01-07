'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Organization {
  id: string
  name: string
  role: string
}

interface OrgSwitcherProps {
  organizations: Organization[]
  currentOrgId: string
}

export function OrgSwitcher({ organizations, currentOrgId }: OrgSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleChange(newOrgId: string) {
    startTransition(async () => {
      // Call API to set active org
      await fetch('/api/org/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: newOrgId }),
      })
      // Refresh to apply new org context
      router.refresh()
    })
  }

  if (organizations.length === 0) {
    return null
  }

  return (
    <select
      value={currentOrgId}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name} ({org.role})
        </option>
      ))}
    </select>
  )
}
