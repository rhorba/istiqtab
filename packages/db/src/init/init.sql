-- Istiqtab DB initialisation
-- Run once as superuser before migrations.
-- Creates the app role, sets grants, enables RLS on auth tables.

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

-- Default privileges so future tables are covered automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO istiqtab_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO istiqtab_app;

-- ── RLS on users ──────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- Users can only read/write their own row
CREATE POLICY users_self ON users
  FOR ALL
  TO istiqtab_app
  USING (
    id = current_setting('app.current_user_id', true)
  );

-- Admins bypass row filter
CREATE POLICY users_admin ON users
  FOR ALL
  TO istiqtab_app
  USING (
    current_setting('app.current_user_role', true) = 'admin'
  );

-- ── RLS on sessions ───────────────────────────────────────────────────────────
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;

CREATE POLICY sessions_owner ON sessions
  FOR ALL
  TO istiqtab_app
  USING (
    user_id = current_setting('app.current_user_id', true)
  );

CREATE POLICY sessions_admin ON sessions
  FOR ALL
  TO istiqtab_app
  USING (
    current_setting('app.current_user_role', true) = 'admin'
  );

-- ── RLS on accounts ───────────────────────────────────────────────────────────
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts FORCE ROW LEVEL SECURITY;

CREATE POLICY accounts_owner ON accounts
  FOR ALL
  TO istiqtab_app
  USING (
    user_id = current_setting('app.current_user_id', true)
  );

CREATE POLICY accounts_admin ON accounts
  FOR ALL
  TO istiqtab_app
  USING (
    current_setting('app.current_user_role', true) = 'admin'
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- Sprint 1 — RLS for per-user private tables
--
-- Two patterns:
--   * owner+admin    : private rows keyed to a user (profiles, docs, chat, …)
--   * append+admin   : audit logs — anyone may INSERT, only admin may SELECT
--
-- Public catalog tables (partner_profiles, expert_profiles, expert_slots,
-- cri_regions, incentive_rules, incentive_results, wizard_step_templates) are
-- intentionally NOT under RLS — they are browseable; edit authorization is
-- enforced at the app layer (withRole + ownership check).
-- ══════════════════════════════════════════════════════════════════════════════

-- helper note: current_setting(..., true) returns NULL (not error) when unset.

-- ── investor_profiles (owner = user_id) ───────────────────────────────────────
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles FORCE ROW LEVEL SECURITY;
CREATE POLICY investor_profiles_self ON investor_profiles FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY investor_profiles_admin ON investor_profiles FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── investor_documents (Category A PII — owner = user_id) ─────────────────────
ALTER TABLE investor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_documents FORCE ROW LEVEL SECURITY;
CREATE POLICY investor_documents_self ON investor_documents FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY investor_documents_admin ON investor_documents FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── ai_chat_messages (owner = user_id; null for anonymous) ────────────────────
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_chat_self ON ai_chat_messages FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY ai_chat_admin ON ai_chat_messages FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── introduction_requests (owner = investor via subquery) ─────────────────────
ALTER TABLE introduction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE introduction_requests FORCE ROW LEVEL SECURITY;
CREATE POLICY intro_requests_owner ON introduction_requests FOR ALL TO istiqtab_app
  USING (
    investor_id IN (
      SELECT id FROM investor_profiles
      WHERE user_id = current_setting('app.current_user_id', true)
    )
  );
CREATE POLICY intro_requests_admin ON introduction_requests FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── notifications (owner = user_id) ───────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
CREATE POLICY notifications_self ON notifications FOR ALL TO istiqtab_app
  USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY notifications_admin ON notifications FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── expert_bookings (owner = booking investor OR the expert) ──────────────────
ALTER TABLE expert_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_bookings FORCE ROW LEVEL SECURITY;
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
CREATE POLICY expert_bookings_admin ON expert_bookings FOR ALL TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── audit_logs (append for all; read for admin) ───────────────────────────────
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT TO istiqtab_app WITH CHECK (true);
CREATE POLICY audit_logs_admin_read ON audit_logs FOR SELECT TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');

-- ── access_audit_logs (Category A PII access trail — append all; read admin) ──
ALTER TABLE access_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_audit_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY access_audit_insert ON access_audit_logs FOR INSERT TO istiqtab_app WITH CHECK (true);
CREATE POLICY access_audit_admin_read ON access_audit_logs FOR SELECT TO istiqtab_app
  USING (current_setting('app.current_user_role', true) = 'admin');
