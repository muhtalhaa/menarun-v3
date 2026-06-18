-- AlterTable
ALTER TABLE "events" ADD COLUMN "jam_mulai_submit" VARCHAR(5) NOT NULL DEFAULT '00:00';
ALTER TABLE "events" ADD COLUMN "jam_batas_submit" VARCHAR(5) NOT NULL DEFAULT '23:59';
