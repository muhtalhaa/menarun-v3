-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "token" VARCHAR(12) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "no_aims" CHAR(5) NOT NULL,
    "majlis" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "usia" SMALLINT NOT NULL,
    "no_hp" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(150) NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "strava_url" VARCHAR(500) NOT NULL,
    "strava_activity_id" VARCHAR(50),
    "distance_km" DECIMAL(8,2) NOT NULL,
    "duration_sec" INTEGER NOT NULL,
    "duration_type" VARCHAR(10) NOT NULL DEFAULT 'moving',
    "pace_per_km" VARCHAR(10),
    "activity_date" DATE NOT NULL,
    "raw_meta" JSONB,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "majlis" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "majlis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participants_token_key" ON "participants"("token");

-- CreateIndex
CREATE UNIQUE INDEX "participants_no_aims_key" ON "participants"("no_aims");

-- CreateIndex
CREATE INDEX "participants_majlis_idx" ON "participants"("majlis");

-- CreateIndex
CREATE INDEX "participants_email_idx" ON "participants"("email");

-- CreateIndex
CREATE INDEX "events_is_active_tanggal_selesai_idx" ON "events"("is_active", "tanggal_selesai" DESC);

-- CreateIndex
CREATE INDEX "activities_event_id_participant_id_idx" ON "activities"("event_id", "participant_id");

-- CreateIndex
CREATE INDEX "activities_participant_id_submitted_at_idx" ON "activities"("participant_id", "submitted_at");

-- CreateIndex
CREATE INDEX "activities_event_id_distance_km_idx" ON "activities"("event_id", "distance_km" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "activities_strava_activity_id_event_id_key" ON "activities"("strava_activity_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_strava_activity_id_key" ON "activities"("strava_activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "majlis_nama_key" ON "majlis"("nama");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
