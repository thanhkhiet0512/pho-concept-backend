-- Migration: 20260424000001_create_catering_tables
-- Created: 2026-04-24

-- 1. CateringStatus enum
DO $$ BEGIN
  CREATE TYPE "CateringStatus" AS ENUM (
    'INQUIRY', 'QUOTED', 'DEPOSIT_PAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. catering_packages
CREATE TABLE IF NOT EXISTS "catering_packages" (
  "package_id"       BIGSERIAL PRIMARY KEY,
  "name"             VARCHAR(255) NOT NULL,
  "description_i18n" JSONB NOT NULL DEFAULT '{}',
  "min_guests"       INTEGER NOT NULL,
  "max_guests"       INTEGER NOT NULL,
  "base_price"       DECIMAL(10,2) NOT NULL,
  "includes_i18n"    JSONB NOT NULL DEFAULT '[]',
  "is_active"        BOOLEAN NOT NULL DEFAULT true,
  "sort_order"       INTEGER NOT NULL DEFAULT 0,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "catering_packages_name_key" ON "catering_packages"("name");
CREATE INDEX IF NOT EXISTS "catering_packages_is_active_sort_order_idx"
  ON "catering_packages"("is_active", "sort_order");

-- 3. catering_requests
CREATE TABLE IF NOT EXISTS "catering_requests" (
  "request_id"              BIGSERIAL PRIMARY KEY,
  "token"                   VARCHAR(255) NOT NULL DEFAULT gen_random_uuid()::text,
  "location_id"             BIGINT NOT NULL,
  "package_id"              BIGINT,
  "contact_name"            VARCHAR(255) NOT NULL,
  "contact_email"           VARCHAR(255) NOT NULL,
  "contact_phone"           VARCHAR(20) NOT NULL,
  "event_date"              DATE NOT NULL,
  "event_time"              VARCHAR(5) NOT NULL,
  "guest_count"             INTEGER NOT NULL,
  "venue"                   VARCHAR(500),
  "special_request"         TEXT,
  "status"                  "CateringStatus" NOT NULL DEFAULT 'INQUIRY',
  "quoted_amount"           DECIMAL(10,2),
  "deposit_amount"          DECIMAL(10,2),
  "deposit_paid_at"         TIMESTAMP(3),
  "stripe_payment_intent"   VARCHAR(255),
  "quotation_deadline"      TIMESTAMP(3),
  "internal_note"           TEXT,
  "handled_by_admin_id"     BIGINT,
  "deleted_at"              TIMESTAMP(3),
  "created_at"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "catering_requests_token_key" UNIQUE ("token"),
  CONSTRAINT "catering_requests_location_id_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("location_id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "catering_requests_package_id_fkey"
    FOREIGN KEY ("package_id") REFERENCES "catering_packages"("package_id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "catering_requests_handled_by_admin_id_fkey"
    FOREIGN KEY ("handled_by_admin_id") REFERENCES "admin_users"("admin_user_id")
    ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "catering_requests_status_idx"
  ON "catering_requests"("status");
CREATE INDEX IF NOT EXISTS "catering_requests_event_date_idx"
  ON "catering_requests"("event_date");
CREATE INDEX IF NOT EXISTS "catering_requests_location_id_event_date_idx"
  ON "catering_requests"("location_id", "event_date");
CREATE INDEX IF NOT EXISTS "catering_requests_contact_email_idx"
  ON "catering_requests"("contact_email");
CREATE INDEX IF NOT EXISTS "catering_requests_token_idx"
  ON "catering_requests"("token");

-- 4. catering_items
CREATE TABLE IF NOT EXISTS "catering_items" (
  "item_id"              BIGSERIAL PRIMARY KEY,
  "catering_request_id"  BIGINT NOT NULL,
  "menu_item_id"         BIGINT,
  "custom_name"          VARCHAR(255),
  "quantity"             INTEGER NOT NULL,
  "unit_price"           DECIMAL(10,2) NOT NULL,
  "note"                 VARCHAR(500),
  "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "catering_items_catering_request_id_fkey"
    FOREIGN KEY ("catering_request_id") REFERENCES "catering_requests"("request_id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "catering_items_menu_item_id_fkey"
    FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("menu_item_id")
    ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "catering_items_catering_request_id_idx"
  ON "catering_items"("catering_request_id");
