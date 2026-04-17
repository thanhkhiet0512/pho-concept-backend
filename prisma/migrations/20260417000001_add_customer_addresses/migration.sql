-- Migration: Add customer_addresses table
-- Created: 2026-04-17

BEGIN;

-- Create customer_addresses table
CREATE TABLE IF NOT EXISTS "customer_addresses" (
    "customer_address_id" BIGSERIAL PRIMARY KEY,
    "customer_id" BIGINT NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zip" VARCHAR(20) NOT NULL,
    "is_default" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster customer lookups
CREATE INDEX IF NOT EXISTS "customer_addresses_customer_id_idx" ON "customer_addresses"("customer_id");

-- Add foreign key constraint
ALTER TABLE "customer_addresses" 
    ADD CONSTRAINT "fk_customer_addresses_customer"
    FOREIGN KEY ("customer_id") 
    REFERENCES "customers"("customer_id") 
    ON DELETE CASCADE;

COMMIT;
