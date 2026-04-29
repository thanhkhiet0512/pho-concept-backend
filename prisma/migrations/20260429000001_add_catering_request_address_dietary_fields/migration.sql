-- Add address and dietary fields to catering_requests
ALTER TABLE "catering_requests"
  ADD COLUMN IF NOT EXISTS "city"           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "state"          VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "zip"            VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "dietary_notes"  TEXT;
