-- Migration: Remove UUID columns, use BigInt auto-increment IDs
-- Generated: 2026-04-17

-- Drop existing UUID columns
ALTER TABLE admin_users DROP COLUMN IF EXISTS uuid;
ALTER TABLE customers DROP COLUMN IF EXISTS uuid;
ALTER TABLE locations DROP COLUMN IF EXISTS uuid;
