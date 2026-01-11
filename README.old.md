# HR SaaS

A modern, modular HR management system built with Next.js, Supabase, and AI.

## 🚀 Features

### Core Platform
- ✅ **Multi-tenant Architecture**: Organization-based data isolation with RLS
- ✅ **Authentication**: Secure user authentication with Supabase Auth
- ✅ **Role-based Access Control**: Owner, Admin, Recruiter, Viewer roles
- ✅ **Internationalization**: Multi-language support with next-intl
- ✅ **Modular Design**: Easy to add new modules without refactoring

### Writing Module
- ✅ **Test Management**: Create, edit, and manage writing assessments
- ✅ **Candidate Invitations**: Email-based test invitations with unique links
- ✅ **Test Submission**: Candidate-facing test interface
- ✅ **AI Auto-scoring**: Automated scoring using OpenAI GPT-4.1-mini
- ✅ **Manual Scoring**: 5-dimension scoring system
- ✅ **Link Management**: Track and manage all test links
- ✅ **Email Notifications**: Automated invitation and result emails

### User & Organization Management
- ✅ **Organization Settings**: Manage organization details
- ✅ **Team Members**: Invite, manage, and assign roles
- ✅ **User Profile**: Personal settings and preferences
- ✅ **Organization Switching**: Support for multiple organizations

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4.1-mini
- **Email**: Resend
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 📦 Installation

### Prerequisites

- Node.js 22+
- pnpm 10+
- Supabase account
- OpenAI API key
- Resend API key (optional, for emails)

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/venokacode/hr-saas.git
cd hr-saas
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Resend (optional)
RESEND_API_KEY=re_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Supabase database**

- Go to Supabase Dashboard > SQL Editor
- Copy and execute `supabase/schema.sql`
- Verify all 9 tables are created

5. **Run development server**

```bash
pnpm dev
```

Open http://localhost:3000

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/venokacode/hr-saas)

1. Click the button above
2. Configure environment variables
3. Deploy!

## 📚 Documentation

- [Implementation Guide](./IMPLEMENTATION.md) - Technical implementation details
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment guide
- [Security Fixes](./SECURITY_FIXES.md) - Security enhancements
- [Auth Implementation](./AUTH_IMPLEMENTATION.md) - Authentication system
- [Writing Module](./WRITING_MODULE_DELIVERY.md) - Writing module features
- [High Priority Features](./HIGH_PRIORITY_FEATURES_DELIVERY.md) - Advanced features
- [User & Org Management](./USER_ORG_MANAGEMENT_DELIVERY.md) - Management features
- [AI Scoring & Links](./AI_SCORING_LINKS_DELIVERY.md) - AI and link management

## 🏗️ Project Structure

```
hr-saas/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public routes (login, test submission)
│   │   ├── (app)/             # Authenticated routes
│   │   │   └── app/
│   │   │       ├── modules/   # Module routes
│   │   │       └── settings/  # Settings routes
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   ├── layout/           # Layout components
│   │   └── modules/          # Module-specific components
│   ├── features/             # Business logic
│   │   ├── auth/            # Authentication
│   │   ├── organization/    # Organization management
│   │   ├── modules/         # Module registry
│   │   └── writing/         # Writing module
│   ├── lib/                  # Utilities
│   │   ├── supabase/        # Supabase clients
│   │   ├── ai-scoring.ts    # AI scoring service
│   │   ├── email.ts         # Email service
│   │   └── ...
│   └── messages/             # i18n translations
├── supabase/                 # Database schema
└── public/                   # Static assets
```

## 🔐 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Organization-based data isolation
- ✅ Role-based access control
- ✅ UUID validation and rate limiting
- ✅ Environment variable validation
- ✅ Type-safe implementation

## 🧪 Testing

```bash
# Type check
pnpm exec tsc --noEmit

# Lint
pnpm lint

# Build
pnpm build
```

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📞 Support

- Documentation: See docs above
- Issues: [GitHub Issues](https://github.com/venokacode/hr-saas/issues)

## 🎉 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [Resend](https://resend.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ by the HR SaaS Team**
