/**
 * Phase 2 test — Strava parser + submit pipeline + rate limit
 * Run: export $(grep -v '^#' .env | xargs) && npx tsx scripts/test-phase2.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { processActivitySubmission } from "../lib/activity-submission";
import { computePacePerKm, formatDuration } from "../lib/format";
import {
  DAILY_SUBMISSION_LIMIT,
  getDailySubmissionCount,
  getRemainingDailyQuota,
  getWibDayBounds,
} from "../lib/rate-limiter";
import { parseStravaHtml, extractActivityId } from "../lib/strava-parser";
import { prisma } from "../lib/prisma";

const TEST_AIMS = "99002";
const TEST_STRAVA_ID = "99999001";

async function ensureTestParticipant() {
  let participant = await prisma.participant.findUnique({
    where: { noAims: TEST_AIMS },
  });

  if (!participant) {
    participant = await prisma.participant.create({
      data: {
        token: "TESTP2TK",
        nama: "Phase2 Tester",
        noAims: TEST_AIMS,
        majlis: "Jakarta Pusat",
        email: "phase2@menarun.app",
        usia: 30,
        noHp: "081234567891",
      },
    });
  }

  return participant;
}

async function getDemoEvent() {
  const event = await prisma.event.findFirst({
    where: { isActive: true },
    orderBy: { tanggalMulai: "desc" },
  });
  if (!event) throw new Error("Tidak ada event aktif — jalankan seed dulu");
  return event;
}

function mockStravaData(activityDate: string) {
  const d = new Date(activityDate);
  const label = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  const html = readFileSync(
    join(process.cwd(), "tests/fixtures/strava-run.html"),
    "utf-8"
  )
    .replace("Monday, June 9, 2025", label)
    .replace("2025-06-09", activityDate);

  return parseStravaHtml(
    html,
    `https://www.strava.com/activities/${TEST_STRAVA_ID}`
  );
}

async function cleanup() {
  const participant = await prisma.participant.findUnique({
    where: { noAims: TEST_AIMS },
  });
  if (participant) {
    await prisma.activity.deleteMany({
      where: { participantId: participant.id },
    });
  }
}

function testParserFixture() {
  console.log("\n1. Parse Strava HTML fixture...");

  const result = mockStravaData("2025-06-09");

  if (result.distanceKm !== 5.23) {
    throw new Error(`Distance salah: ${result.distanceKm}`);
  }
  if (result.durationSec !== 28 * 60 + 15) {
    throw new Error(`Duration salah: ${result.durationSec}`);
  }
  if (result.stravaActivityId !== TEST_STRAVA_ID) {
    throw new Error(`Activity ID salah: ${result.stravaActivityId}`);
  }
  if (result.sportType !== "Run") {
    throw new Error(`Sport type salah: ${result.sportType}`);
  }
  if (result.pacePerKm !== computePacePerKm(5.23, 28 * 60 + 15)) {
    throw new Error(`Pace salah: ${result.pacePerKm}`);
  }

  console.log(`   ✓ Parsed: ${result.distanceKm} km, ${formatDuration(result.durationSec)}, pace ${result.pacePerKm}`);
}

function testExtractActivityId() {
  console.log("\n2. Extract activity ID dari URL...");

  const id = extractActivityId(
    "https://www.strava.com/activities/12345678/share"
  );
  if (id !== "12345678") throw new Error(`ID salah: ${id}`);

  console.log("   ✓ extractActivityId OK");
}

function testWibDayBounds() {
  console.log("\n3. WIB day bounds...");

  const bounds = getWibDayBounds();
  if (bounds.end <= bounds.start) throw new Error("Bounds invalid");

  console.log(`   ✓ WIB bounds: ${bounds.start.toISOString()} – ${bounds.end.toISOString()}`);
}

async function testOutsideEventPeriod() {
  console.log("\n4. Submit aktivitas di luar periode event...");

  const participant = await ensureTestParticipant();
  const event = await getDemoEvent();

  const beforeStart = new Date(event.tanggalMulai);
  beforeStart.setDate(beforeStart.getDate() - 14);
  const dateStr = beforeStart.toISOString().slice(0, 10);

  const stravaData = {
    ...mockStravaData(dateStr),
    stravaActivityId: "99998999",
  };

  const result = await processActivitySubmission(
    participant,
    event,
    "https://www.strava.com/activities/99998999",
    stravaData
  );

  if (result.success) {
    throw new Error("Aktivitas di luar periode seharusnya ditolak");
  }
  if (result.error.code !== "OUTSIDE_EVENT_PERIOD") {
    throw new Error(`Kode error salah: ${result.error.code}`);
  }
  if (!result.error.message.includes("di luar periode event")) {
    throw new Error(`Pesan error tidak sesuai: ${result.error.message}`);
  }

  console.log(`   ✓ Ditolak: ${result.error.message}`);
}

async function testSubmitSuccess() {
  console.log("\n5. Submit aktivitas (mock parse)...");

  const participant = await ensureTestParticipant();
  const event = await getDemoEvent();
  const stravaData = mockStravaData(
    event.tanggalMulai.toISOString().slice(0, 10)
  );

  const result = await processActivitySubmission(
    participant,
    event,
    `https://www.strava.com/activities/${TEST_STRAVA_ID}`,
    stravaData
  );

  if (!result.success) {
    throw new Error("Submit gagal: " + result.error.message);
  }
  if (result.data.sisaKuotaHariIni !== DAILY_SUBMISSION_LIMIT - 1) {
    throw new Error(
      `Sisa kuota salah: ${result.data.sisaKuotaHariIni}, expected ${DAILY_SUBMISSION_LIMIT - 1}`
    );
  }

  console.log(
    `   ✓ Submit berhasil — sisa kuota: ${result.data.sisaKuotaHariIni}`
  );
}

async function testDuplicateActivity() {
  console.log("\n6. Submit duplikat Strava ID...");

  const participant = await ensureTestParticipant();
  const event = await getDemoEvent();
  const stravaData = mockStravaData(
    event.tanggalMulai.toISOString().slice(0, 10)
  );

  const result = await processActivitySubmission(
    participant,
    event,
    `https://www.strava.com/activities/${TEST_STRAVA_ID}`,
    stravaData
  );

  if (result.success) throw new Error("Duplikat seharusnya ditolak");
  if (result.error.code !== "DUPLICATE_ACTIVITY") {
    throw new Error(`Kode error salah: ${result.error.code}`);
  }

  console.log("   ✓ Duplikat aktivitas ditolak");
}

async function testRateLimit() {
  console.log("\n7. Rate limit 2/hari per token...");

  const participant = await ensureTestParticipant();
  const event = await getDemoEvent();

  const stravaData2 = {
    ...mockStravaData(event.tanggalMulai.toISOString().slice(0, 10)),
    stravaActivityId: "99999002",
  };

  const second = await processActivitySubmission(
    participant,
    event,
    "https://www.strava.com/activities/99999002",
    stravaData2
  );

  if (!second.success) {
    throw new Error("Submit kedua gagal: " + second.error.message);
  }

  const stravaData3 = {
    ...mockStravaData(event.tanggalMulai.toISOString().slice(0, 10)),
    stravaActivityId: "99999003",
  };

  const third = await processActivitySubmission(
    participant,
    event,
    "https://www.strava.com/activities/99999003",
    stravaData3
  );

  if (third.success) throw new Error("Submit ketiga seharusnya ditolak (rate limit)");
  if (third.error.code !== "RATE_LIMIT_EXCEEDED") {
    throw new Error(`Kode error salah: ${third.error.code}`);
  }

  const count = await getDailySubmissionCount(participant.id);
  const remaining = await getRemainingDailyQuota(participant.id);

  if (count !== DAILY_SUBMISSION_LIMIT) {
    throw new Error(`Count harus ${DAILY_SUBMISSION_LIMIT}, got ${count}`);
  }
  if (remaining !== 0) {
    throw new Error(`Remaining harus 0, got ${remaining}`);
  }

  console.log("   ✓ Rate limit 2/hari enforced");
}

async function main() {
  console.log("=== Phase 2 Test ===");

  testParserFixture();
  testExtractActivityId();
  testWibDayBounds();

  await cleanup();
  await testOutsideEventPeriod();
  await testSubmitSuccess();
  await testDuplicateActivity();
  await testRateLimit();

  console.log("\n=== Semua test Phase 2 LULUS ===\n");
}

main()
  .catch((e) => {
    console.error("\n✗ TEST GAGAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
