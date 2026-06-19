-- CreateTable
CREATE TABLE "activity_reports" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "reported_participant_id" TEXT NOT NULL,
    "reporter_participant_id" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_reports_event_id_reported_participant_id_idx" ON "activity_reports"("event_id", "reported_participant_id");

-- CreateIndex
CREATE INDEX "activity_reports_reporter_participant_id_created_at_idx" ON "activity_reports"("reporter_participant_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "activity_reports" ADD CONSTRAINT "activity_reports_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_reports" ADD CONSTRAINT "activity_reports_reported_participant_id_fkey" FOREIGN KEY ("reported_participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_reports" ADD CONSTRAINT "activity_reports_reporter_participant_id_fkey" FOREIGN KEY ("reporter_participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
