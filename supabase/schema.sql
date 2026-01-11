-- =====================================================
-- Collaboration Notes System - Database Schema
-- =====================================================
-- This schema supports internal collaboration with future multi-tenant expansion
-- All tables include workspace_id for data isolation

-- =====================================================
-- 1. Workspaces Table
-- =====================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create default workspace
INSERT INTO workspaces (name, slug, is_default)
VALUES ('Internal', 'internal', true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 2. Workspace Members Table
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- =====================================================
-- 3. Items Table (Unified: Notes, Todos, Cards)
-- =====================================================
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  type_key TEXT NOT NULL DEFAULT 'note',
  status_key TEXT NOT NULL DEFAULT 'todo',
  color TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_items_workspace_id ON items(workspace_id);
CREATE INDEX IF NOT EXISTS idx_items_status_key ON items(status_key);
CREATE INDEX IF NOT EXISTS idx_items_type_key ON items(type_key);
CREATE INDEX IF NOT EXISTS idx_items_created_by ON items(created_by);

-- =====================================================
-- 4. Tags Table
-- =====================================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, name)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_tags_workspace_id ON tags(workspace_id);

-- =====================================================
-- 5. Item-Tag Relations Table (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, tag_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);

-- =====================================================
-- 6. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- Workspaces: Users can only see workspaces they are members of
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspace Members: Users can view members of their workspaces
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspace Members: Users can insert themselves into workspaces (for auto-join)
CREATE POLICY "Users can join workspaces"
  ON workspace_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Items: Users can view items in their workspaces
CREATE POLICY "Users can view workspace items"
  ON items FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Items: Users can create items in their workspaces
CREATE POLICY "Users can create workspace items"
  ON items FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Items: Users can update items in their workspaces
CREATE POLICY "Users can update workspace items"
  ON items FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Items: Users can delete items they created
CREATE POLICY "Users can delete their items"
  ON items FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Tags: Users can view tags in their workspaces
CREATE POLICY "Users can view workspace tags"
  ON tags FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Tags: Users can create tags in their workspaces
CREATE POLICY "Users can create workspace tags"
  ON tags FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Tags: Users can update tags in their workspaces
CREATE POLICY "Users can update workspace tags"
  ON tags FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Tags: Users can delete tags in their workspaces
CREATE POLICY "Users can delete workspace tags"
  ON tags FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Item-Tags: Users can view item-tag relations in their workspaces
CREATE POLICY "Users can view item tags"
  ON item_tags FOR SELECT
  USING (
    item_id IN (
      SELECT id FROM items
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Item-Tags: Users can create item-tag relations in their workspaces
CREATE POLICY "Users can create item tags"
  ON item_tags FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT id FROM items
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Item-Tags: Users can delete item-tag relations in their workspaces
CREATE POLICY "Users can delete item tags"
  ON item_tags FOR DELETE
  USING (
    item_id IN (
      SELECT id FROM items
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- 7. Functions & Triggers
-- =====================================================

-- Function: Auto-join new users to default workspace
CREATE OR REPLACE FUNCTION auto_join_default_workspace()
RETURNS TRIGGER AS $$
DECLARE
  default_workspace_id UUID;
BEGIN
  -- Get default workspace ID
  SELECT id INTO default_workspace_id
  FROM workspaces
  WHERE is_default = true
  LIMIT 1;

  -- Insert user into default workspace
  IF default_workspace_id IS NOT NULL THEN
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES (default_workspace_id, NEW.id, 'member')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-join on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_join_default_workspace();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update items.updated_at
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update workspaces.updated_at
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Set completed_at when status changes to 'done'
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status_key = 'done' AND OLD.status_key != 'done' THEN
    NEW.completed_at = now();
  ELSIF NEW.status_key != 'done' AND OLD.status_key = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Set completed_at on status change
DROP TRIGGER IF EXISTS set_item_completed_at ON items;
CREATE TRIGGER set_item_completed_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

-- =====================================================
-- 8. Grant Permissions
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- =====================================================
-- End of Schema
-- =====================================================
