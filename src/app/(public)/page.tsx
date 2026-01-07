import { useTranslations } from 'next-intl'
import { ModuleCard } from '@/components/modules/ModuleCard'
import { getAllModules } from '@/features/modules/registry'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LandingPage() {
  const t = useTranslations()
  const modules = getAllModules()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('landing.hero.subtitle')}
        </p>
        <Link href="/login">
          <Button size="lg">{t('landing.hero.cta')}</Button>
        </Link>
      </section>

      {/* Modules Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((module) => (
            <ModuleCard key={module.key} module={module} />
          ))}
        </div>
      </section>
    </div>
  )
}
