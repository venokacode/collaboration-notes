import { useTranslations } from 'next-intl'

export default function WritingReportsPage() {
  const t = useTranslations()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Writing Reports
      </h1>
      <p className="text-gray-600 mb-8">
        View assessment reports and analytics
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-muted-foreground">
          Reports list and analytics will be implemented here.
        </p>
      </div>
    </div>
  )
}
