# HR SaaS Implementation Guide

## 项目概述

这是一个基于 Next.js 和 Supabase 构建的模块化 HR SaaS 平台，采用 ShipAny Template Two 参考架构。

## 已完成的功能（Phase 0-5）

### ✅ Phase 0: 项目骨架
- 创建了完整的目录结构
- 配置了 TypeScript 路径别名（`@/`）
- 设置了 Supabase 客户端（browser/server/admin）

### ✅ Phase 1: 数据库 Schema
- 创建了 9 个核心表：
  - `organizations` - 组织表
  - `org_members` - 组织成员表
  - `user_settings` - 用户设置表
  - `tests` - 测试表（支持 module_key）
  - `test_links` - 测试链接表
  - `candidates` - 候选人表
  - `attempts` - 答题记录表
  - `reports` - 报告表
  - `audit_logs` - 审计日志表
- 实现了完整的 RLS 策略
- 创建了辅助函数（`is_org_member`, `org_role`, `has_write_permission`）

### ✅ Phase 2: 国际化（i18n）
- 集成了 `next-intl`
- 创建了英语翻译文件（`src/messages/en.json`）
- 实现了 locale 解析优先级：
  1. 数据库用户设置
  2. Cookie
  3. 浏览器 Accept-Language（待实现）
  4. 默认英语
- 创建了 `LocaleSwitcher` 组件

### ✅ Phase 3: 模块注册表
- 创建了模块注册表（`src/features/modules/registry.ts`）
- 三个模块：
  - `writing` - active（激活）
  - `video_intro` - coming_soon（即将推出）
  - `signature` - coming_soon（即将推出）
- 实现了 `ModuleCard` 组件（状态感知）
- 安装了 UI 组件库依赖（shadcn/ui 风格）

### ✅ Phase 4: 组织上下文
- 实现了组织管理工具函数
- 创建了 Middleware（认证 + 组织验证）
- 实现了 `OrgSwitcher` 组件
- 创建了组织切换 API 路由（`/api/org/switch`）

### ✅ Phase 5: 路由骨架
- 创建了完整的路由结构：
  - `(public)/` - 公共路由（Landing, Login）
  - `(app)/app/` - 认证路由（Dashboard, Onboarding）
  - `(app)/app/modules/[moduleKey]/` - 模块管理路由
- 实现了模块验证逻辑（coming_soon 占位页面）
- 为 writing 模块创建了子路由（tests, reports）

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js | 16.1.1 |
| 语言 | TypeScript | 5.9.3 |
| 样式 | Tailwind CSS | 4.1.18 |
| 数据库 | Supabase (PostgreSQL) | - |
| 认证 | Supabase Auth | - |
| 国际化 | next-intl | 4.7.0 |
| UI 组件 | shadcn/ui 风格 | - |
| 包管理器 | pnpm | 10.27.0 |

## 项目结构

```
hr-saas/
├── src/
│   ├── app/
│   │   ├── (public)/              # 公共路由
│   │   │   ├── page.tsx           # Landing 页面
│   │   │   └── login/page.tsx     # 登录页面
│   │   ├── (app)/                 # 认证路由
│   │   │   └── app/
│   │   │       ├── layout.tsx     # App Shell
│   │   │       ├── page.tsx       # Dashboard
│   │   │       ├── onboarding/
│   │   │       │   └── org/page.tsx
│   │   │       └── modules/
│   │   │           └── [moduleKey]/
│   │   │               ├── layout.tsx
│   │   │               └── page.tsx
│   │   └── api/
│   │       └── org/switch/route.ts
│   ├── features/
│   │   ├── modules/
│   │   │   └── registry.ts        # 模块注册表
│   │   ├── writing/               # Writing 模块业务逻辑（待实现）
│   │   ├── video_intro/           # 占位符
│   │   └── signature/             # 占位符
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── browser.ts
│   │   │   ├── server.ts
│   │   │   ├── admin.ts
│   │   │   └── types.ts
│   │   ├── i18n/
│   │   │   ├── config.ts
│   │   │   ├── getLocale.ts
│   │   │   └── request.ts
│   │   ├── organization.ts
│   │   └── utils.ts
│   ├── components/
│   │   ├── modules/
│   │   │   └── ModuleCard.tsx
│   │   ├── layout/
│   │   │   ├── OrgSwitcher.tsx
│   │   │   └── LocaleSwitcher.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── card.tsx
│   └── messages/
│       └── en.json
├── supabase/
│   └── schema.sql                 # 数据库 Schema
├── .env.local                     # 环境变量
├── .env.example
├── middleware.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

## 下一步工作

### 立即需要完成的任务

1. **执行数据库 Schema**
   - 在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/schema.sql`
   - 验证所有表和 RLS 策略已创建

2. **实现 Supabase Auth**
   - 在 Login 页面集成 Supabase Auth
   - 实现登录/注册流程
   - 添加 OAuth 提供商（Google/GitHub）

3. **实现组织入门流程**
   - 完成 `/app/onboarding/org` 页面
   - 实现创建组织功能
   - 实现加入组织功能

4. **开发 Writing 模块**
   - 实现测试创建功能
   - 实现测试链接生成
   - 实现候选人答题界面
   - 实现报告生成和查看

### 未来扩展

5. **Video Intro 模块**
   - 激活模块状态
   - 实现视频录制功能
   - 实现视频审查功能

6. **Signature 模块**
   - 激活模块状态
   - 实现电子签名功能
   - 实现合同管理

7. **多语言支持**
   - 添加中文翻译（`src/messages/zh.json`）
   - 添加其他语言支持

## 环境变量

### 必需的环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 可选的环境变量

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # 用于管理员操作
```

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 类型检查
pnpm exec tsc --noEmit

# Lint 检查
pnpm lint
```

## 关键设计决策

### 1. 模块注册表作为单一数据源
所有模块的状态、路由和元数据都在 `src/features/modules/registry.ts` 中定义。这确保了：
- UI 和服务端使用相同的模块状态
- 新增模块只需在注册表中添加配置
- 不需要修改现有代码

### 2. 双重安全防护
- **UI 层**：`ModuleCard` 组件根据模块状态禁用按钮
- **服务端**：`modules/[moduleKey]/layout.tsx` 验证模块状态，未激活模块显示占位页面

### 3. RLS 多租户隔离
- 所有数据表都启用了 RLS
- 使用辅助函数（`is_org_member`, `org_role`）简化策略编写
- 确保跨组织数据完全隔离

### 4. 国际化优先
- 从第一天起就支持多语言
- 所有文本都使用翻译 key，不硬编码
- 用户可以随时切换语言

## 常见问题

### Q: 如何添加新模块？
A: 在 `src/features/modules/registry.ts` 中添加模块配置，然后创建对应的路由文件。

### Q: 如何激活 coming_soon 模块？
A: 将模块的 `status` 从 `'coming_soon'` 改为 `'active'`。

### Q: 如何添加新语言？
A: 
1. 在 `src/lib/i18n/config.ts` 中添加 locale
2. 创建 `src/messages/{locale}.json` 翻译文件
3. 更新 `localeNames` 映射

### Q: 如何测试 RLS 策略？
A: 在 Supabase Dashboard 中使用不同的用户账号测试跨组织访问是否被阻止。

## 贡献指南

1. 遵循现有的目录结构和命名约定
2. 所有新功能必须有相应的翻译 key
3. 服务端操作必须验证组织权限
4. 提交前运行 `pnpm exec tsc --noEmit` 确保无类型错误

## 许可证

MIT
