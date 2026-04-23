-- Migration: 20260424000002_create_notification_logs
-- Created: 2026-04-24

CREATE TABLE IF NOT EXISTS "notification_logs" (
  "log_id"      BIGSERIAL PRIMARY KEY,
  "type"        VARCHAR(10) NOT NULL,
  "recipient"   VARCHAR(255) NOT NULL,
  "subject"     VARCHAR(500),
  "template"    VARCHAR(100) NOT NULL,
  "status"      VARCHAR(10) NOT NULL,
  "error"       TEXT,
  "metadata"    JSONB,
  "sent_at"     TIMESTAMP(3),
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "notification_logs_type_status_idx"
  ON "notification_logs"("type", "status");
CREATE INDEX IF NOT EXISTS "notification_logs_recipient_idx"
  ON "notification_logs"("recipient");
CREATE INDEX IF NOT EXISTS "notification_logs_template_idx"
  ON "notification_logs"("template");
