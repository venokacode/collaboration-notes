# Deployment Guide

This guide covers deploying the Collaboration Notes System to production.

## Prerequisites

- Supabase account
- Vercel account (or other hosting platform)
- Domain name (optional)

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - Name: `collaboration-notes`
   - Database Password: (generate strong password)
   - Region: (select closest to users)
4. Wait for project to be ready

### 1.2 Execute Database Schema

1. Go to SQL Editor in Supabase Dashboard
2. Copy content from `supabase/schema.sql`
3. Paste and execute
4. Verify all tables are created:
   - workspaces
   - workspace_members
   - items
   - tags
   - item_tags

### 1.3 Get API Keys

1. Go to Project Settings > API
2. Copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

## Step 2: Deploy to Vercel

### 2.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Select the repository

### 2.2 Configure Build Settings

- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

### 2.3 Set Environment Variables

Add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit deployment URL

## Step 3: Post-Deployment Testing

### 3.1 Test Authentication

1. Visit your deployment URL
2. Sign up with a new account
3. Verify auto-join to "Internal" workspace

### 3.2 Test Core Features

1. **Create Item**
   - Click "New Item"
   - Fill in title, content, type, status
   - Add tags
   - Save

2. **Update Status**
   - Change status to "In Progress"
   - Change status to "Done"
   - Verify item moves to Completed page

3. **Tags**
   - Create new tag
   - Apply to item
   - Verify tag displays correctly

4. **Restore**
   - Go to Completed page
   - Click "Restore" on item
   - Verify item returns to main page

## Troubleshooting

### Build Errors

**Error**: `Module not found`
- Solution: Run `pnpm install` locally and commit `pnpm-lock.yaml`

**Error**: `TypeScript errors`
- Solution: Run `pnpm exec tsc --noEmit` locally and fix errors

### Runtime Errors

**Error**: `Unauthorized` on API calls
- Check Supabase URL and keys are correct
- Verify RLS policies are enabled

**Error**: `No workspace found`
- Check default workspace exists in database
- Verify auto-join trigger is working

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Service role key stored as secret
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Environment variables not committed to Git

---

**Deployment complete! Your Collaboration Notes System is live.**
