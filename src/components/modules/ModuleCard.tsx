'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Module } from '@/features/modules/registry'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  module: Module
}

export function ModuleCard({ module }: ModuleCardProps) {
  const t = useTranslations()
  const isActive = module.status === 'active'

  return (
    <Card className={cn(
      'transition-all hover:shadow-lg',
      !isActive && 'opacity-60 cursor-not-allowed'
    )}>
      <CardHeader>
        <CardTitle>{t(module.titleKey)}</CardTitle>
        <CardDescription>{t(module.descKey)}</CardDescription>
      </CardHeader>
      <CardContent>
        {!isActive && (
          <p className="text-sm text-muted-foreground italic">
            {t('modules.comingSoonTooltip')}
          </p>
        )}
      </CardContent>
      <CardFooter>
        {isActive ? (
          <Link href={module.adminPath} className="w-full">
            <Button className="w-full">{t('common.getStarted')}</Button>
          </Link>
        ) : (
          <Button disabled className="w-full">
            {t('common.comingSoon')}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
