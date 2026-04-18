-- Reset production database
-- Run in Coolify PostgreSQL terminal:
-- psql -U postgres -d postgres < reset-production.sql

BEGIN;

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

COMMIT;
