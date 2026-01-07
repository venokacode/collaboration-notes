import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OrgOnboardingPage() {
  const t = useTranslations('organization')

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('create')}</CardTitle>
          <CardDescription>
            Create or join an organization to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Organization onboarding flow will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
