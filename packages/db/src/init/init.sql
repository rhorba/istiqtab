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
