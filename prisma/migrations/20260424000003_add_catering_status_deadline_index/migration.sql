-- AddIndex for expire check query performance
CREATE INDEX IF NOT EXISTS "catering_requests_status_quotation_deadline_idx"
  ON "catering_requests"("status", "quotation_deadline");
