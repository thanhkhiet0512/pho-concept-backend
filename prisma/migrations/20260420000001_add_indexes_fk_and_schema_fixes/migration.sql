-- Migration: add_indexes_fk_and_schema_fixes
-- Idempotent: safe to run multiple times

-- ─────────────────────────────────────────────
-- 1. MediaFile → AdminUser FK relation
-- ─────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "media_files"
    ADD CONSTRAINT "media_files_uploaded_by_fkey"
    FOREIGN KEY ("uploaded_by") REFERENCES "admin_users"("admin_user_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────
-- 2. MediaFile: add updated_at column
-- ─────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "media_files" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ─────────────────────────────────────────────
-- 3. AdminUser indexes: role, is_active
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "admin_users_role_idx" ON "admin_users"("role");
CREATE INDEX IF NOT EXISTS "admin_users_is_active_idx" ON "admin_users"("is_active");

-- ─────────────────────────────────────────────
-- 4. Customer indexes: is_active, phone
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "customers_is_active_idx" ON "customers"("is_active");
CREATE INDEX IF NOT EXISTS "customers_phone_idx" ON "customers"("phone");

-- ─────────────────────────────────────────────
-- 5. Location index: is_active
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "locations_is_active_idx" ON "locations"("is_active");

-- ─────────────────────────────────────────────
-- 6. Event index: drop old [eventDate, isActive], add [isActive, eventDate]
-- ─────────────────────────────────────────────
DROP INDEX IF EXISTS "events_event_date_is_active_idx";
CREATE INDEX IF NOT EXISTS "events_is_active_event_date_idx" ON "events"("is_active", "event_date");

-- ─────────────────────────────────────────────
-- 7. MediaFile indexes: uploaded_by, mime_type (idempotent)
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "media_files_uploaded_by_idx" ON "media_files"("uploaded_by");
CREATE INDEX IF NOT EXISTS "media_files_mime_type_idx" ON "media_files"("mime_type");
