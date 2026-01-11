# HR SaaS 部署指南

本指南将帮助你将 HR SaaS 项目部署到 Vercel 生产环境。

---

## 📋 前置要求

在开始部署之前，请确保你已经：

- ✅ GitHub 账号
- ✅ Vercel 账号（可以使用 GitHub 登录）
- ✅ Supabase 项目（已执行 schema.sql）
- ✅ OpenAI API Key（用于 AI 评分）
- ✅ Resend API Key（用于发送邮件）

---

## 🚀 部署步骤

### 步骤 1：准备 Supabase

1. **确认数据库 Schema 已执行**
   - 登录 Supabase Dashboard
   - 进入 SQL Editor
   - 确认所有表已创建（9 个表）

2. **获取 Supabase 凭据**
   - 进入 Settings > API
   - 复制以下信息：
     - `Project URL`
     - `anon/public` key
     - `service_role` key（可选，用于管理员操作）

---

### 步骤 2：准备 API Keys

#### OpenAI API Key
1. 访问 https://platform.openai.com/api-keys
2. 创建新的 API Key
3. 复制密钥（以 `sk-proj-` 开头）

#### Resend API Key
1. 访问 https://resend.com/api-keys
2. 创建新的 API Key
3. 复制密钥（以 `re_` 开头）
4. 配置发件人域名（可选，用于生产环境）

---

### 步骤 3：部署到 Vercel

#### 方法 1：通过 Vercel Dashboard（推荐）

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 "Import Git Repository"
   - 找到并选择 `venokacode/hr-saas`
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `pnpm build`（自动检测）
   - **Install Command**: `pnpm install`（自动检测）

4. **配置环境变量**
   
   点击 "Environment Variables"，添加以下变量：

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   OPENAI_API_KEY=sk-proj-...
   RESEND_API_KEY=re_...
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **注意**：
   - `NEXT_PUBLIC_APP_URL` 先留空，部署后再更新
   - 所有环境变量都选择 "Production"、"Preview" 和 "Development"

5. **开始部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-3 分钟）

6. **更新 APP_URL**
   - 部署完成后，复制 Vercel 提供的域名
   - 进入 Settings > Environment Variables
   - 更新 `NEXT_PUBLIC_APP_URL` 为实际域名
   - 重新部署（Deployments > 最新部署 > Redeploy）

---

#### 方法 2：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
cd hr-saas
vercel --prod

# 按照提示配置项目
# 添加环境变量（同上）
```

---

### 步骤 4：验证部署

1. **访问应用**
   - 打开 Vercel 提供的域名
   - 应该看到登录页面

2. **测试功能**
   - 注册新账号
   - 创建组织
   - 创建测试
   - 邀请候选人
   - 测试 AI 评分

3. **检查日志**
   - 在 Vercel Dashboard 中查看 Functions 日志
   - 确认没有错误

---

## 🔧 自定义域名（可选）

### 添加自定义域名

1. **在 Vercel 中配置**
   - 进入项目 Settings > Domains
   - 点击 "Add Domain"
   - 输入你的域名（例如：`hr.yourdomain.com`）

2. **配置 DNS**
   - 在你的域名提供商处添加 DNS 记录
   - **CNAME** 记录：`hr` → `cname.vercel-dns.com`
   - 或 **A** 记录：指向 Vercel IP

3. **更新环境变量**
   - 更新 `NEXT_PUBLIC_APP_URL` 为自定义域名
   - 重新部署

---

## 📧 配置邮件发送

### Resend 域名验证

1. **添加域名**
   - 登录 Resend Dashboard
   - 进入 Domains
   - 添加你的域名

2. **配置 DNS 记录**
   - 按照 Resend 提供的说明添加 DNS 记录
   - 等待验证（通常几分钟）

3. **更新发件人邮箱**
   - 在 `src/lib/email.ts` 中更新 `FROM_EMAIL`
   - 或添加环境变量 `FROM_EMAIL=noreply@yourdomain.com`

---

## 🔒 生产环境安全检查

### 必须完成的安全配置

- [ ] **Supabase RLS 策略已启用**
  - 所有表都启用了 RLS
  - 验证策略正确工作

- [ ] **环境变量已正确配置**
  - 所有密钥都已添加
  - `service_role_key` 仅在必要时使用

- [ ] **邮箱验证已启用**（推荐）
  - Supabase Auth > Providers > Email
  - 启用 "Confirm email"

- [ ] **密码策略已配置**
  - Supabase Auth > Policies
  - 设置最小密码长度

- [ ] **API Keys 已保护**
  - 不要在客户端代码中暴露 `service_role_key`
  - 使用环境变量存储所有密钥

---

## 📊 监控和日志

### Vercel 监控

1. **访问 Analytics**
   - Vercel Dashboard > Analytics
   - 查看访问量、性能指标

2. **查看日志**
   - Vercel Dashboard > Deployments > 选择部署 > Logs
   - 实时查看函数执行日志

3. **错误追踪**
   - 考虑集成 Sentry（可选）
   - 添加错误监控和告警

### Supabase 监控

1. **查看数据库使用情况**
   - Supabase Dashboard > Database > Usage
   - 监控连接数、存储空间

2. **查看 API 使用情况**
   - Supabase Dashboard > API > Usage
   - 监控请求量、带宽

---

## 🔄 持续部署

### 自动部署

Vercel 已自动配置 CI/CD：

- ✅ **Push 到 `main` 分支** → 自动部署到生产环境
- ✅ **Push 到其他分支** → 自动创建预览部署
- ✅ **Pull Request** → 自动创建预览部署

### 手动部署

如果需要手动触发部署：

1. 进入 Vercel Dashboard
2. 选择项目
3. 点击 "Deployments"
4. 点击最新部署的 "..." → "Redeploy"

---

## 🐛 故障排除

### 常见问题

#### 1. 构建失败

**错误**：`Type error` 或 `Module not found`

**解决方案**：
```bash
# 本地测试构建
cd hr-saas
pnpm build

# 修复错误后推送
git add .
git commit -m "fix: 修复构建错误"
git push
```

#### 2. 环境变量未生效

**症状**：应用运行但功能异常

**解决方案**：
- 检查环境变量拼写
- 确认环境变量已选择 "Production"
- 重新部署项目

#### 3. Supabase 连接失败

**错误**：`Invalid Supabase URL` 或 `Authentication failed`

**解决方案**：
- 验证 Supabase URL 格式正确
- 确认 API Keys 正确
- 检查 Supabase 项目状态

#### 4. AI 评分失败

**错误**：`OpenAI API error`

**解决方案**：
- 验证 `OPENAI_API_KEY` 正确
- 检查 OpenAI 账户余额
- 查看 Vercel 函数日志

#### 5. 邮件发送失败

**错误**：`Resend API error`

**解决方案**：
- 验证 `RESEND_API_KEY` 正确
- 检查域名验证状态
- 确认发件人邮箱正确

---

## 📝 环境变量完整列表

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Supabase service role key | `eyJhbGci...` |
| `OPENAI_API_KEY` | ✅ | OpenAI API key | `sk-proj-...` |
| `RESEND_API_KEY` | ✅ | Resend API key | `re_...` |
| `NEXT_PUBLIC_APP_URL` | ✅ | 应用 URL | `https://hr.yourdomain.com` |
| `FROM_EMAIL` | ⚠️ | 发件人邮箱 | `noreply@yourdomain.com` |

**图例**：
- ✅ 必需
- ⚠️ 推荐（某些功能需要）

---

## 🎉 部署完成

恭喜！你的 HR SaaS 应用已成功部署到生产环境。

### 下一步

1. **测试所有功能**
2. **邀请团队成员**
3. **配置自定义域名**
4. **设置监控和告警**
5. **收集用户反馈**

---

## 📞 获取帮助

如果遇到问题：

1. **查看文档**：本文档和项目 README
2. **查看日志**：Vercel Dashboard > Logs
3. **检查 GitHub Issues**：查看是否有类似问题
4. **联系支持**：
   - Vercel: https://vercel.com/support
   - Supabase: https://supabase.com/support

---

**祝你部署顺利！** 🚀
