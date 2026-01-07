import { useTranslations } from 'next-intl'

export default function WritingTestsPage() {
  const t = useTranslations()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Writing Tests
      </h1>
      <p className="text-gray-600 mb-8">
        Manage your writing assessment tests
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-muted-foreground">
          Tests list and management will be implemented here.
        </p>
      </div>
    </div>
  )
}
