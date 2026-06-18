-- Istiqtab DB initialisation — IDEMPOTENT (safe to re-run).
-- Run as superuser AFTER `pnpm db:migrate` so all tables exist.
-- Creates the app role, grants, enables RLS, and upserts all policies.

-- ── App role ──────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'istiqtab_app') THEN
    CREATE ROLE istiqtab_app LOGIN;
  END IF;
END
$$;

-- ── Schema grants ─────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO istiqtab_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO istiqtab_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO istiqtab_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO istiqtab_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO istiqtab_app;

-- ── RLS on users ──────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_self ON users;
CREATE POLICY users_self ON users
  FOR ALL TO istiqtab_app
  USING (id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS users_admin ON users;
CREATE POLICY users_admin ON users
  FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── RLS on sessions ───────────────────────────────────────────────────────────
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sessions_owner ON sessions;
CREATE POLICY sessions_owner ON sessions
  FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS sessions_admin ON sessions;
CREATE POLICY sessions_admin ON sessions
  FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── RLS on accounts ───────────────────────────────────────────────────────────
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS accounts_owner ON accounts;
CREATE POLICY accounts_owner ON accounts
  FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS accounts_admin ON accounts;
CREATE POLICY accounts_admin ON accounts
  FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ══════════════════════════════════════════════════════════════════════════════
-- Per-user private tables (Sprint 1+)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── investor_profiles ─────────────────────────────────────────────────────────
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investor_profiles_self ON investor_profiles;
CREATE POLICY investor_profiles_self ON investor_profiles FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS investor_profiles_admin ON investor_profiles;
CREATE POLICY investor_profiles_admin ON investor_profiles FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── investor_documents (Category A PII) ──────────────────────────────────────
ALTER TABLE investor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_documents FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investor_documents_self ON investor_documents;
CREATE POLICY investor_documents_self ON investor_documents FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS investor_documents_admin ON investor_documents;
CREATE POLICY investor_documents_admin ON investor_documents FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── ai_chat_messages ──────────────────────────────────────────────────────────
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_chat_self ON ai_chat_messages;
CREATE POLICY ai_chat_self ON ai_chat_messages FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS ai_chat_admin ON ai_chat_messages;
CREATE POLICY ai_chat_admin ON ai_chat_messages FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── introduction_requests ─────────────────────────────────────────────────────
ALTER TABLE introduction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE introduction_requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS intro_requests_owner ON introduction_requests;
CREATE POLICY intro_requests_owner ON introduction_requests FOR ALL TO istiqtab_app
  USING (
    investor_id IN (
      SELECT id FROM investor_profiles
      WHERE user_id = current_setting('app.current_user_id', true)
    )
  );

DROP POLICY IF EXISTS intro_requests_admin ON introduction_requests;
CREATE POLICY intro_requests_admin ON introduction_requests FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── notifications ─────────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_self ON notifications;
CREATE POLICY notifications_self ON notifications FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS notifications_admin ON notifications;
CREATE POLICY notifications_admin ON notifications FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── expert_bookings ───────────────────────────────────────────────────────────
ALTER TABLE expert_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_bookings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expert_bookings_party ON expert_bookings;
CREATE POLICY expert_bookings_party ON expert_bookings FOR ALL TO istiqtab_app
  USING (
    investor_id IN (
      SELECT id FROM investor_profiles
      WHERE user_id = current_setting('app.current_user_id', true)
    )
    OR expert_id IN (
      SELECT id FROM expert_profiles
      WHERE user_id = current_setting('app.current_user_id', true)
    )
  );

DROP POLICY IF EXISTS expert_bookings_admin ON expert_bookings;
CREATE POLICY expert_bookings_admin ON expert_bookings FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── audit_logs (append for all; read for admin only) ─────────────────────────
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT TO istiqtab_app WITH CHECK (true);

DROP POLICY IF EXISTS audit_logs_admin_read ON audit_logs;
CREATE POLICY audit_logs_admin_read ON audit_logs FOR SELECT TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── access_audit_logs (Category A PII access trail) ──────────────────────────
ALTER TABLE access_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS access_audit_insert ON access_audit_logs;
CREATE POLICY access_audit_insert ON access_audit_logs FOR INSERT TO istiqtab_app WITH CHECK (true);

DROP POLICY IF EXISTS access_audit_admin_read ON access_audit_logs;
CREATE POLICY access_audit_admin_read ON access_audit_logs FOR SELECT TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');
