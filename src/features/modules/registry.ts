export const MODULE_KEYS = ['writing', 'video_intro', 'signature'] as const
export type ModuleKey = (typeof MODULE_KEYS)[number]

export const MODULE_STATUS = ['active', 'coming_soon'] as const
export type ModuleStatus = (typeof MODULE_STATUS)[number]

export interface Module {
  key: ModuleKey
  status: ModuleStatus
  titleKey: string
  descKey: string
  adminPath: string
  publicPath?: string
}

export const MODULES: Record<ModuleKey, Module> = {
  writing: {
    key: 'writing',
    status: 'active',
    titleKey: 'modules.writing.title',
    descKey: 'modules.writing.description',
    adminPath: '/app/modules/writing',
    publicPath: '/writing',
  },
  video_intro: {
    key: 'video_intro',
    status: 'coming_soon',
    titleKey: 'modules.video_intro.title',
    descKey: 'modules.video_intro.description',
    adminPath: '/app/modules/video_intro',
  },
  signature: {
    key: 'signature',
    status: 'coming_soon',
    titleKey: 'modules.signature.title',
    descKey: 'modules.signature.description',
    adminPath: '/app/modules/signature',
  },
} as const

export function getModule(key: string): Module | null {
  if (key in MODULES) {
    return MODULES[key as ModuleKey]
  }
  return null
}

export function isModuleActive(key: string): boolean {
  const module = getModule(key)
  return module?.status === 'active'
}

export function assertModuleActive(key: string): void {
  if (!isModuleActive(key)) {
    throw new Error(`Module "${key}" is not active`)
  }
}

export function getActiveModules(): Module[] {
  return Object.values(MODULES).filter((m) => m.status === 'active')
}

export function getAllModules(): Module[] {
  return Object.values(MODULES)
}
