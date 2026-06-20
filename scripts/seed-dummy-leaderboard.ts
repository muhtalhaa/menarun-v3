/**
 * Dummy leaderboard seeder
 *
 * Membuat:
 * - 2 event (10 hari & 15 hari)
 * - 30 peserta per event (60 total, no AIMS unik)
 * - 12 aktivitas per peserta, tersebar di hari berbeda (1–2 aktivitas/hari)
 *
 * Jalankan manual (lihat README di bawah atau package.json script db:seed:dummy).
 * JANGAN di-import ke seed.ts utama.
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";
import { computePacePerKm } from "../lib/format";
import { durationSecFromPaceAndDistance } from "../lib/pace";

const prisma = new PrismaClient();

const DUMMY_EVENT_NAMES = ["Dummy Run 10 Hari", "Dummy Run 15 Hari"] as const;

const EVENTS_CONFIG = [
  {
    nama: DUMMY_EVENT_NAMES[0],
    deskripsi:
      "Event dummy 10 hari untuk testing leaderboard, pagination, dan statistik.",
    durationDays: 10,
    aimsPrefix: "81",
  },
  {
    nama: DUMMY_EVENT_NAMES[1],
    deskripsi:
      "Event dummy 15 hari untuk testing leaderboard, pagination, dan statistik.",
    durationDays: 15,
    aimsPrefix: "82",
  },
] as const;

const PARTICIPANTS_PER_EVENT = 30;
const ACTIVITIES_PER_PARTICIPANT = 12;

function startOfUtcDate(date: Date): Date {
  return new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return startOfUtcDate(next);
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function buildActivityDayOffsets(
  eventDayCount: number,
  participantIndex: number
): number[] {
  const offsets: number[] = [];
  const dayUsage = new Array<number>(eventDayCount).fill(0);
  let remaining = ACTIVITIES_PER_PARTICIPANT;
  let cursor = participantIndex % eventDayCount;

  while (remaining > 0) {
    if (dayUsage[cursor] < 2) {
      const preferDouble =
        dayUsage[cursor] === 0 &&
        remaining >= 2 &&
        (participantIndex + cursor + offsets.length) % 4 !== 0;
      const toAdd = Math.min(preferDouble ? 2 : 1, 2 - dayUsage[cursor], remaining);

      for (let i = 0; i < toAdd; i++) {
        offsets.push(cursor);
      }

      dayUsage[cursor] += toAdd;
      remaining -= toAdd;
    }

    cursor = (cursor + 1) % eventDayCount;

    if (cursor === 0 && remaining > 0 && dayUsage.every((count) => count >= 2)) {
      throw new Error("Tidak cukup hari event untuk 12 aktivitas per peserta.");
    }
  }

  return offsets.sort((a, b) => a - b);
}

function pickPace(participantIndex: number, activityIndex: number): string {
  const paceMinutes = 5 + ((participantIndex * 3 + activityIndex) % 4);
  const paceSeconds = (participantIndex * 7 + activityIndex * 11) % 60;
  return `${paceMinutes}:${pad2(paceSeconds)}`;
}

function pickDistanceKm(participantIndex: number, activityIndex: number): number {
  const base = 4 + ((participantIndex + activityIndex) % 9);
  const fraction = (participantIndex + activityIndex * 3) % 4;
  return Math.round((base + fraction * 0.25) * 100) / 100;
}

function pickElevation(participantIndex: number, activityIndex: number): number {
  return ((participantIndex * 13 + activityIndex * 17) % 21) * 10;
}

async function cleanupDummyData() {
  const dummyEvents = await prisma.event.findMany({
    where: { nama: { in: [...DUMMY_EVENT_NAMES] } },
    select: { id: true },
  });

  if (dummyEvents.length === 0) {
    return;
  }

  const eventIds = dummyEvents.map((event) => event.id);

  await prisma.activity.deleteMany({ where: { eventId: { in: eventIds } } });
  await prisma.participantBan.deleteMany({ where: { eventId: { in: eventIds } } });
  await prisma.activityReport.deleteMany({ where: { eventId: { in: eventIds } } });
  await prisma.event.deleteMany({ where: { id: { in: eventIds } } });

  for (let eventIndex = 0; eventIndex < EVENTS_CONFIG.length; eventIndex++) {
    const aimsPrefix = EVENTS_CONFIG[eventIndex].aimsPrefix;
    await prisma.participant.deleteMany({
      where: {
        noAims: {
          startsWith: aimsPrefix,
        },
      },
    });
  }

  console.log("Data dummy lama dihapus.");
}

async function loadMajlisNames(): Promise<string[]> {
  const fromDb = await prisma.majlis.findMany({
    where: { isActive: true },
    select: { nama: true },
    orderBy: { nama: "asc" },
  });

  if (fromDb.length > 0) {
    return fromDb.map((row) => row.nama);
  }

  const majlisPath = join(process.cwd(), "data", "majlis.json");
  return JSON.parse(readFileSync(majlisPath, "utf-8")) as string[];
}

async function seedDummyLeaderboard() {
  const majlisNames = await loadMajlisNames();
  if (majlisNames.length === 0) {
    throw new Error("Daftar majlis kosong. Jalankan seed utama dulu: npm run db:seed");
  }

  await cleanupDummyData();

  const today = startOfUtcDate(new Date());

  for (const [eventIndex, config] of EVENTS_CONFIG.entries()) {
    const tanggalMulai = today;
    const tanggalSelesai = addUtcDays(today, config.durationDays - 1);

    const event = await prisma.event.create({
      data: {
        nama: config.nama,
        deskripsi: config.deskripsi,
        tanggalMulai,
        tanggalSelesai,
        jamMulaiSubmit: "06:00",
        jamBatasSubmit: "22:00",
        isActive: true,
      },
    });

    console.log(`\nEvent: ${event.nama}`);
    console.log(`  Periode: ${tanggalMulai.toISOString().slice(0, 10)} s/d ${tanggalSelesai.toISOString().slice(0, 10)}`);

    const activitiesToCreate: Prisma.ActivityCreateManyInput[] = [];

    for (let participantIndex = 0; participantIndex < PARTICIPANTS_PER_EVENT; participantIndex++) {
      const participantNo = participantIndex + 1;
      const noAims = `${config.aimsPrefix}${String(participantNo).padStart(3, "0")}`;
      const token = `DMY${eventIndex + 1}${String(participantNo).padStart(4, "0")}`;
      const majlis = majlisNames[participantIndex % majlisNames.length];

      const participant = await prisma.participant.create({
        data: {
          token,
          nama: `Peserta Dummy ${eventIndex + 1}-${pad2(participantNo)}`,
          noAims,
          majlis,
          email: `dummy.e${eventIndex + 1}.p${pad2(participantNo)}@menarun.test`,
          usia: 20 + (participantIndex % 25),
          noHp: `08123${String(eventIndex + 1)}${String(participantNo).padStart(5, "0")}`.slice(0, 13),
        },
      });

      const dayOffsets = buildActivityDayOffsets(
        config.durationDays,
        participantIndex
      );

      dayOffsets.forEach((dayOffset, activityIndex) => {
        const activityDate = addUtcDays(tanggalMulai, dayOffset);
        const distanceKm = pickDistanceKm(participantIndex, activityIndex);
        const pacePerKm = pickPace(participantIndex, activityIndex);
        const durationSec = durationSecFromPaceAndDistance(pacePerKm, distanceKm);
        const submittedAt = new Date(activityDate);
        submittedAt.setUTCHours(8 + (activityIndex % 10), (activityIndex * 7) % 60, 0, 0);

        activitiesToCreate.push({
          participantId: participant.id,
          eventId: event.id,
          stravaUrl: `https://www.strava.com/activities/dummy-e${eventIndex + 1}-p${pad2(participantNo)}-a${pad2(activityIndex + 1)}`,
          stravaActivityId: `dummy-e${eventIndex + 1}-p${pad2(participantNo)}-a${pad2(activityIndex + 1)}`,
          distanceKm,
          durationSec,
          durationType: "moving",
          pacePerKm: computePacePerKm(distanceKm, durationSec) ?? pacePerKm,
          elevationM: pickElevation(participantIndex, activityIndex),
          activityDate,
          submittedAt,
        });
      });
    }

    const batchSize = 100;
    for (let i = 0; i < activitiesToCreate.length; i += batchSize) {
      await prisma.activity.createMany({
        data: activitiesToCreate.slice(i, i + batchSize),
      });
    }

    console.log(`  Peserta: ${PARTICIPANTS_PER_EVENT}`);
    console.log(`  Aktivitas: ${activitiesToCreate.length}`);
  }

  console.log("\nDummy seed selesai.");
  console.log("  Event 1: Dummy Run 10 Hari — 30 peserta × 12 aktivitas");
  console.log("  Event 2: Dummy Run 15 Hari — 30 peserta × 12 aktivitas");
}

seedDummyLeaderboard()
  .catch((error) => {
    console.error("\nDummy seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
