-- AddUniqueConstraint: prevent duplicate day-of-week entries per location
CREATE UNIQUE INDEX "location_hours_location_id_day_of_week_key" ON "location_hours"("location_id", "day_of_week");
