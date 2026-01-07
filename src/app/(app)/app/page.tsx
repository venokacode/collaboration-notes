import { useTranslations } from 'next-intl'
import { ModuleCard } from '@/components/modules/ModuleCard'
import { getAllModules } from '@/features/modules/registry'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const modules = getAllModules()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('welcome')}</p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {t('modules')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <ModuleCard key={module.key} module={module} />
          ))}
        </div>
      </section>
    </div>
  )
}
