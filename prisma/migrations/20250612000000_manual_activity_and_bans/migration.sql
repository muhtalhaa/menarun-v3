-- AlterTable
ALTER TABLE "activities" ADD COLUMN "elevation_m" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "participant_bans" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participant_bans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_participant_id_event_id_submitted_at_idx" ON "activities"("participant_id", "event_id", "submitted_at");

-- CreateIndex
CREATE INDEX "participant_bans_participant_id_event_id_idx" ON "participant_bans"("participant_id", "event_id");

-- AddForeignKey
ALTER TABLE "participant_bans" ADD CONSTRAINT "participant_bans_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_bans" ADD CONSTRAINT "participant_bans_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
