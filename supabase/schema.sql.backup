-- ============================================================================
-- HR SaaS Database Schema
-- ============================================================================
-- This schema supports a multi-tenant HR SaaS with modular architecture
-- Modules: writing (active), video_intro (coming soon), signature (coming soon)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. ORG MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'recruiter', 'viewer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON org_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id);

-- ============================================================================
-- 3. USER SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  locale text DEFAULT 'en',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. TESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  module_key text NOT NULL DEFAULT 'writing',
  title text NOT NULL,
  description text,
  prompt text NOT NULL,
  time_limit_minutes integer,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_module_key CHECK (module_key IN ('writing', 'video_intro', 'signature'))
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tests_org_module ON tests(organization_id, module_key);
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON tests(created_by);

-- ============================================================================
-- 5. TEST LINKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS test_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz,
  max_attempts integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_links ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_test_links_test_id ON test_links(test_id);
CREATE INDEX IF NOT EXISTS idx_test_links_token ON test_links(token);

-- ============================================================================
-- 6. CANDIDATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, email)
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_candidates_org_id ON candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- ============================================================================
-- 7. ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_link_id uuid REFERENCES test_links(id) ON DELETE CASCADE NOT NULL,
  candidate_id uuid REFERENCES candidates(id) ON DELETE SET NULL,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  content text,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_attempts_test_link_id ON attempts(test_link_id);
CREATE INDEX IF NOT EXISTS idx_attempts_candidate_id ON attempts(candidate_id);

-- ============================================================================
-- 8. REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES attempts(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  score jsonb,
  feedback text,
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reports_attempt_id ON reports(attempt_id);
CREATE INDEX IF NOT EXISTS idx_reports_org_id ON reports(organization_id);

-- ============================================================================
-- 9. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

-- Check if user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's role in an organization
CREATE OR REPLACE FUNCTION org_role(org_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM org_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has write permission (owner, admin, or recruiter)
CREATE OR REPLACE FUNCTION has_write_permission(org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN org_role(org_id) IN ('owner', 'admin', 'recruiter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES: ORGANIZATIONS
-- ============================================================================

-- Users can read organizations they are members of
CREATE POLICY "org_members_read_organizations"
ON organizations FOR SELECT
USING (is_org_member(id));

-- Only owners can update organizations
CREATE POLICY "org_owners_update_organizations"
ON organizations FOR UPDATE
USING (org_role(id) = 'owner');

-- Only owners can delete organizations
CREATE POLICY "org_owners_delete_organizations"
ON organizations FOR DELETE
USING (org_role(id) = 'owner');

-- Any authenticated user can create an organization
CREATE POLICY "authenticated_create_organizations"
ON organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- RLS POLICIES: ORG_MEMBERS
-- ============================================================================

-- Members can read other members in their organization
CREATE POLICY "org_members_read_members"
ON org_members FOR SELECT
USING (is_org_member(organization_id));

-- Owners and admins can add members
CREATE POLICY "org_admins_create_members"
ON org_members FOR INSERT
WITH CHECK (
  org_role(organization_id) IN ('owner', 'admin')
);

-- Owners and admins can update members
CREATE POLICY "org_admins_update_members"
ON org_members FOR UPDATE
USING (
  org_role(organization_id) IN ('owner', 'admin')
);

-- Owners and admins can remove members
CREATE POLICY "org_admins_delete_members"
ON org_members FOR DELETE
USING (
  org_role(organization_id) IN ('owner', 'admin')
);

-- ============================================================================
-- RLS POLICIES: USER_SETTINGS
-- ============================================================================

-- Users can read their own settings
CREATE POLICY "users_read_own_settings"
ON user_settings FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own settings
CREATE POLICY "users_insert_own_settings"
ON user_settings FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own settings
CREATE POLICY "users_update_own_settings"
ON user_settings FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: TESTS
-- ============================================================================

-- Organization members can read tests
CREATE POLICY "org_members_read_tests"
ON tests FOR SELECT
USING (is_org_member(organization_id));

-- Owners, admins, and recruiters can create tests
CREATE POLICY "org_writers_create_tests"
ON tests FOR INSERT
WITH CHECK (has_write_permission(organization_id));

-- Owners, admins, and recruiters can update tests
CREATE POLICY "org_writers_update_tests"
ON tests FOR UPDATE
USING (has_write_permission(organization_id));

-- Owners, admins, and recruiters can delete tests
CREATE POLICY "org_writers_delete_tests"
ON tests FOR DELETE
USING (has_write_permission(organization_id));

-- ============================================================================
-- RLS POLICIES: TEST_LINKS
-- ============================================================================

-- Organization members can read test links for their tests
CREATE POLICY "org_members_read_test_links"
ON test_links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_links.test_id
    AND is_org_member(tests.organization_id)
  )
);

-- Owners, admins, and recruiters can create test links
CREATE POLICY "org_writers_create_test_links"
ON test_links FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_links.test_id
    AND has_write_permission(tests.organization_id)
  )
);

-- Owners, admins, and recruiters can update test links
CREATE POLICY "org_writers_update_test_links"
ON test_links FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_links.test_id
    AND has_write_permission(tests.organization_id)
  )
);

-- Owners, admins, and recruiters can delete test links
CREATE POLICY "org_writers_delete_test_links"
ON test_links FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM tests
    WHERE tests.id = test_links.test_id
    AND has_write_permission(tests.organization_id)
  )
);

-- ============================================================================
-- RLS POLICIES: CANDIDATES
-- ============================================================================

-- Organization members can read candidates
CREATE POLICY "org_members_read_candidates"
ON candidates FOR SELECT
USING (is_org_member(organization_id));

-- Owners, admins, and recruiters can create candidates
CREATE POLICY "org_writers_create_candidates"
ON candidates FOR INSERT
WITH CHECK (has_write_permission(organization_id));

-- Owners, admins, and recruiters can update candidates
CREATE POLICY "org_writers_update_candidates"
ON candidates FOR UPDATE
USING (has_write_permission(organization_id));

-- Owners, admins, and recruiters can delete candidates
CREATE POLICY "org_writers_delete_candidates"
ON candidates FOR DELETE
USING (has_write_permission(organization_id));

-- ============================================================================
-- RLS POLICIES: ATTEMPTS
-- ============================================================================

-- Organization members can read attempts for their tests
CREATE POLICY "org_members_read_attempts"
ON attempts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM test_links
    JOIN tests ON tests.id = test_links.test_id
    WHERE test_links.id = attempts.test_link_id
    AND is_org_member(tests.organization_id)
  )
);

-- Public: Anyone with a valid test link token can create an attempt
CREATE POLICY "public_create_attempts"
ON attempts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM test_links
    WHERE test_links.id = attempts.test_link_id
    AND (test_links.expires_at IS NULL OR test_links.expires_at > now())
  )
);

-- Public: Candidates can update their own attempts
CREATE POLICY "public_update_attempts"
ON attempts FOR UPDATE
USING (
  submitted_at IS NULL -- Can only update before submission
);

-- ============================================================================
-- RLS POLICIES: REPORTS
-- ============================================================================

-- Organization members can read reports
CREATE POLICY "org_members_read_reports"
ON reports FOR SELECT
USING (is_org_member(organization_id));

-- Owners, admins, and recruiters can create reports
CREATE POLICY "org_writers_create_reports"
ON reports FOR INSERT
WITH CHECK (has_write_permission(organization_id));

-- Owners, admins, and recruiters can update reports
CREATE POLICY "org_writers_update_reports"
ON reports FOR UPDATE
USING (has_write_permission(organization_id));

-- Owners, admins, and recruiters can delete reports
CREATE POLICY "org_writers_delete_reports"
ON reports FOR DELETE
USING (has_write_permission(organization_id));

-- ============================================================================
-- RLS POLICIES: AUDIT_LOGS
-- ============================================================================

-- Organization members can read audit logs
CREATE POLICY "org_members_read_audit_logs"
ON audit_logs FOR SELECT
USING (is_org_member(organization_id));

-- System can create audit logs (via service role)
-- No INSERT policy needed as this will be done via admin client

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
BEFORE UPDATE ON tests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Optional - for development)
-- ============================================================================

-- Uncomment below to create a test organization
-- INSERT INTO organizations (name) VALUES ('Test Organization');
