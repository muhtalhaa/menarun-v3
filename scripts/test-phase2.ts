/**
 * Phase 2 test — manual activity submit + rate limit per event
 * Run: export $(grep -v '^#' .env | xargs) && npx tsx scripts/test-phase2.ts
 */
import { processActivitySubmission } from "../lib/activity-submission";
import { durationSecFromPaceAndDistance, isValidPacePerKm } from "../lib/pace";
import {
  DAILY_SUBMISSION_LIMIT,
  getDailySubmissionCount,
  getRemainingDailyQuota,
  getWibDayBounds,
} from "../lib/rate-limiter";
import { extractActivityId } from "../lib/strava-url";
import { prisma } from "../lib/prisma";

const TEST_AIMS = "99002";
const TEST_STRAVA_ID = "99999001";

const manualInput = {
  stravaUrl: `https://www.strava.com/activities/${TEST_STRAVA_ID}`,
  distanceKm: 5.25,
  pacePerKm: "5:30",
  elevationM: 120,
};

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

async function cleanup() {
  const participant = await prisma.participant.findUnique({
    where: { noAims: TEST_AIMS },
  });
  if (participant) {
    await prisma.activity.deleteMany({
      where: { participantId: participant.id },
    });
    await prisma.participantBan.deleteMany({
      where: { participantId: participant.id },
    });
  }
}

function testPaceValidation() {
  console.log("\n1. Validasi format pace...");

  if (!isValidPacePerKm("5:30")) throw new Error("5:30 harus valid");
  if (isValidPacePerKm("5:60")) throw new Error("5:60 harus invalid");
  if (durationSecFromPaceAndDistance("5:30", 5) !== 5 * (5 * 60 + 30)) {
    throw new Error("Konversi pace ke durasi salah");
  }

  console.log("   ✓ Pace validation OK");
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

  console.log(
    `   ✓ WIB bounds: ${bounds.start.toISOString()} – ${bounds.end.toISOString()}`
  );
}

async function testSubmitSuccess() {
  console.log("\n4. Submit aktivitas manual...");

  const participant = await ensureTestParticipant();
  const event = await getDemoEvent();

  const result = await processActivitySubmission(
    participant,
    event,
    manualInput
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
  console.log("\n5. Submit duplikat Strava ID...");

  const participant = await ensureTestParticipant();
  const event = await getDemoEvent();

  const result = await processActivitySubmission(
    participant,
    event,
    manualInput
  );

  if (result.success) throw new Error("Duplikat seharusnya ditolak");
  if (result.error.code !== "DUPLICATE_ACTIVITY") {
    throw new Error(`Kode error salah: ${result.error.code}`);
  }

  console.log("   ✓ Duplikat aktivitas ditolak");
}

async function testRateLimitPerEvent() {
  console.log("\n6. Rate limit 2/hari per token per event...");

  const participant = await ensureTestParticipant();
  const event = await getDemoEvent();

  const second = await processActivitySubmission(participant, event, {
    ...manualInput,
    stravaUrl: "https://www.strava.com/activities/99999002",
  });

  if (!second.success) {
    throw new Error("Submit kedua gagal: " + second.error.message);
  }

  const third = await processActivitySubmission(participant, event, {
    ...manualInput,
    stravaUrl: "https://www.strava.com/activities/99999003",
  });

  if (third.success) {
    throw new Error("Submit ketiga seharusnya ditolak (rate limit)");
  }
  if (third.error.code !== "RATE_LIMIT_EXCEEDED") {
    throw new Error(`Kode error salah: ${third.error.code}`);
  }

  const count = await getDailySubmissionCount(participant.id, event.id);
  const remaining = await getRemainingDailyQuota(participant.id, event.id);

  if (count !== DAILY_SUBMISSION_LIMIT) {
    throw new Error(`Count harus ${DAILY_SUBMISSION_LIMIT}, got ${count}`);
  }
  if (remaining !== 0) {
    throw new Error(`Remaining harus 0, got ${remaining}`);
  }

  console.log("   ✓ Rate limit 2/hari per event enforced");
}

async function main() {
  console.log("=== Phase 2 Test ===");

  testPaceValidation();
  testExtractActivityId();
  testWibDayBounds();

  await cleanup();
  await testSubmitSuccess();
  await testDuplicateActivity();
  await testRateLimitPerEvent();

  console.log("\n=== Semua test Phase 2 LULUS ===\n");
}

main()
  .catch((e) => {
    console.error("\n✗ TEST GAGAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
