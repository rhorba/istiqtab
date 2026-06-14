-- Istiqtab — Docker postgres init hook (runs once on first container start).
-- Table-independent bootstrap only: creates the RLS-bound app role so that
-- DATABASE_URL (istiqtab_app:...) can connect before migrations exist.
--
-- The full RLS policy setup (which references the users/sessions/accounts
-- tables) lives in packages/db/src/init/init.sql and is applied AFTER
-- `pnpm db:migrate` — see README "Local DB setup".
--
-- Password is intentionally the dev default; override for any shared env.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'istiqtab_app') THEN
    CREATE ROLE istiqtab_app LOGIN PASSWORD 'changeme';
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO istiqtab_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO istiqtab_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO istiqtab_app;

-- Future tables/sequences (created by migrations) are covered automatically.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO istiqtab_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO istiqtab_app;
