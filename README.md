# Collaboration Notes System

An internal collaboration notes system built with Next.js, Supabase, and TypeScript.

## Features

### Core Functionality
- ✅ **Unified Item System**: Notes, Todos, and Cards in one place
- ✅ **Two-Dimensional Organization**: Type (function) and Status (progress) are orthogonal
- ✅ **Status Flow**: Todo → In Progress → Done
- ✅ **Automatic Archiving**: Completed items move to Completed Library
- ✅ **Tags System**: Cross-functional classification with multi-tag support
- ✅ **Workspace Isolation**: Multi-tenant ready with RLS

### UI Layout
- **Main Page**: Split view with Todo List (left) and Notes/Cards Area (right)
- **Completed Page**: View and restore archived items
- **Synchronized Panels**: Left and right panels stay in sync
- **English-Only UI**: All interface text in English

### Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Workspace-based data isolation
- ✅ Auto-join new users to default "Internal" workspace
- ✅ Secure authentication with Supabase Auth

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Package Manager**: pnpm

## Installation

### Prerequisites

- Node.js 22+
- pnpm 10+
- Supabase account

### Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd collaboration-notes
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

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Supabase database**

- Go to Supabase Dashboard > SQL Editor
- Copy and execute `supabase/schema.sql`
- Verify all 5 tables are created:
  - workspaces
  - workspace_members
  - items
  - tags
  - item_tags

5. **Run development server**

```bash
pnpm dev
```

Open http://localhost:3000

## Database Schema

### Tables

1. **workspaces** - Workspace definitions (default: "Internal")
2. **workspace_members** - User-workspace relationships
3. **items** - Unified items (notes, todos, cards)
4. **tags** - Workspace tags
5. **item_tags** - Many-to-many item-tag relations

### Key Features

- **Auto-join**: New users automatically join default workspace
- **Auto-timestamp**: `completed_at` set when status changes to "done"
- **Cascading deletes**: Cleanup on item/tag deletion
- **RLS policies**: Enforce workspace isolation

## API Routes

### Items
- `GET /api/items?status=active|done` - List items
- `POST /api/items` - Create item
- `GET /api/items/[id]` - Get item
- `PATCH /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `PATCH /api/tags/[id]` - Update tag
- `DELETE /api/tags/[id]` - Delete tag

## Project Structure

```
collaboration-notes/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   └── app/
│   │   │       ├── page.tsx          # Main page (active items)
│   │   │       ├── completed/        # Completed items page
│   │   │       └── layout.tsx        # App layout
│   │   ├── (public)/
│   │   │   └── login/                # Login page
│   │   └── api/
│   │       ├── items/                # Items API
│   │       └── tags/                 # Tags API
│   ├── components/
│   │   └── items/
│   │       ├── ItemsList.tsx         # Left panel list
│   │       ├── ItemsGrid.tsx         # Right panel grid
│   │       ├── ItemEditor.tsx        # Item editor form
│   │       └── NewItemButton.tsx     # Create button
│   ├── lib/
│   │   └── supabase/                 # Supabase clients
│   └── features/
│       └── auth/                     # Authentication
├── supabase/
│   └── schema.sql                    # Database schema
└── public/                           # Static assets
```

## Usage

### Creating Items

1. Click "New Item" button in the left panel
2. Fill in title, content, type, and status
3. Add tags (create new or select existing)
4. Click "Save"

### Managing Items

- **View**: Click item in left panel or grid to edit
- **Update Status**: Change status dropdown (Todo → In Progress → Done)
- **Complete**: Set status to "Done" - item moves to Completed page
- **Restore**: Go to Completed page and click "Restore"
- **Delete**: Open item editor and click "Delete"

### Using Tags

- **Add Tag**: Type name in "New tag name" field and press Enter
- **Apply Tag**: Click tag buttons in item editor
- **Remove Tag**: Click selected tag to deselect

## Design Principles

1. **Orthogonal Dimensions**: Type (color) and Status are independent
2. **No Feature Creep**: Strictly follows requirements, no extra features
3. **English Only**: All UI text in English
4. **Multi-tenant Ready**: Data model supports future expansion
5. **Completion ≠ Deletion**: Completed items are archived, not deleted

## License

MIT License

---

**Built for internal collaboration**
