# Quick Start Guide

Get your Collaboration Notes System running in 5 minutes.

## Prerequisites

- Node.js 22+
- pnpm 10+
- Supabase account

## Step 1: Install Dependencies

```bash
cd collaboration-notes
pnpm install
```

## Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the entire content of `supabase/schema.sql`
4. Click "Run"
5. Verify 5 tables are created

## Step 3: Configure Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy Project URL and anon key

3. Edit `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 4: Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Create Your First Item

1. Sign up with email
2. You'll be auto-added to "Internal" workspace
3. Click "New Item"
4. Fill in:
   - Title: "My First Note"
   - Content: "Hello World"
   - Type: Note
   - Status: Todo
5. Click "Save"

## Next Steps

- Read [README.md](./README.md) for full documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [PROJECT_DELIVERY.md](./PROJECT_DELIVERY.md) for technical details

## Troubleshooting

**Can't connect to Supabase?**
- Check your URL and API key
- Make sure RLS is enabled

**No items showing?**
- Check browser console for errors
- Verify you're logged in
- Check Supabase logs

**Build errors?**
- Run `pnpm install` again
- Check Node.js version (need 22+)

---

**That's it! You're ready to collaborate.**
