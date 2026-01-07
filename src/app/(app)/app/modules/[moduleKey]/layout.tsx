import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { getModule } from '@/features/modules/registry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ModuleLayout({
  params,
  children,
}: {
  params: Promise<{ moduleKey: string }>
  children: React.ReactNode
}) {
  const { moduleKey } = await params
  const t = useTranslations()
  const module = getModule(moduleKey)

  // Module doesn't exist
  if (!module) {
    notFound()
  }

  // Module is coming soon - show placeholder
  if (module.status === 'coming_soon') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t(module.titleKey)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('modules.comingSoonMessage')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Module is active - render children
  return children
}
