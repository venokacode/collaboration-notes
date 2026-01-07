import { useTranslations } from 'next-intl'
import { getModule } from '@/features/modules/registry'
import { notFound } from 'next/navigation'

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleKey: string }>
}) {
  const { moduleKey } = await params
  const t = useTranslations()
  const module = getModule(moduleKey)

  if (!module) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {t(module.titleKey)}
      </h1>
      <p className="text-gray-600 mb-8">{t(module.descKey)}</p>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-sm text-muted-foreground">
          Module content will be implemented here.
        </p>
      </div>
    </div>
  )
}
