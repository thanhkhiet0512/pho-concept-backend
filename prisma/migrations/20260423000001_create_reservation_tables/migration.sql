-- Migration: create_reservation_tables
-- Creates reservation_slot_configs and reservations tables

-- ─────────────────────────────────────────────
-- 1. ReservationStatus enum
-- ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "ReservationStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'SEATED',
    'COMPLETED',
    'NO_SHOW',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────
-- 2. reservation_slot_configs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "reservation_slot_configs" (
  "slot_config_id"    BIGSERIAL PRIMARY KEY,
  "location_id"       BIGINT NOT NULL UNIQUE,
  "slot_duration"     INTEGER NOT NULL DEFAULT 30,
  "max_guests_per_slot" INTEGER NOT NULL DEFAULT 20,
  "min_advance_hours" INTEGER NOT NULL DEFAULT 1,
  "max_advance_days"  INTEGER NOT NULL DEFAULT 30,
  "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reservation_slot_configs_location_id_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("location_id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────
-- 3. reservations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "reservations" (
  "reservation_id"      BIGSERIAL PRIMARY KEY,
  "token"               VARCHAR(255) NOT NULL DEFAULT gen_random_uuid()::text,
  "location_id"         BIGINT NOT NULL,
  "guest_name"          VARCHAR(255) NOT NULL,
  "guest_email"         VARCHAR(255) NOT NULL,
  "guest_phone"         VARCHAR(20) NOT NULL,
  "party_size"          INTEGER NOT NULL,
  "reservation_date"    DATE NOT NULL,
  "reservation_time"    VARCHAR(5) NOT NULL,
  "status"              "ReservationStatus" NOT NULL DEFAULT 'PENDING',
  "special_request"     TEXT,
  "internal_note"       TEXT,
  "created_by_admin_id" BIGINT,
  "deleted_at"          TIMESTAMP(3),
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reservations_location_id_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("location_id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "reservations_created_by_admin_id_fkey"
    FOREIGN KEY ("created_by_admin_id") REFERENCES "admin_users"("admin_user_id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ─────────────────────────────────────────────
-- 4. Unique constraint on token
-- ─────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "reservations" ADD CONSTRAINT "reservations_token_key" UNIQUE ("token");
EXCEPTION WHEN duplicate_object THEN NULL;
        WHEN others THEN
          IF SQLERRM LIKE '%already exists%' THEN NULL;
          ELSE RAISE;
          END IF;
END $$;

-- ─────────────────────────────────────────────
-- 5. Indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "reservations_location_id_reservation_date_idx"
  ON "reservations"("location_id", "reservation_date");

CREATE INDEX IF NOT EXISTS "reservations_status_idx"
  ON "reservations"("status");

CREATE INDEX IF NOT EXISTS "reservations_guest_email_idx"
  ON "reservations"("guest_email");

CREATE INDEX IF NOT EXISTS "reservations_token_idx"
  ON "reservations"("token");
