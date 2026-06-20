/**
 * Phase 3 test — leaderboard aggregation + event terkini
 * Run: export $(grep -v '^#' .env | xargs) && npx tsx scripts/test-phase3.ts
 */
import { getCurrentEvent, getEventsForFilter } from "../lib/events";
import { getLeaderboardData, getLeaderboardEntries } from "../lib/leaderboard";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("=== Phase 3 Test ===\n");

  const { event, isCurrentlyActive } = await getCurrentEvent();
  if (!event) throw new Error("Tidak ada event — jalankan seed");

  console.log(`1. Event terkini: ${event.nama}`);
  console.log(`   Aktif saat ini: ${isCurrentlyActive ? "ya" : "tidak"}`);

  const filterOptions = await getEventsForFilter();
  if (filterOptions.length === 0) throw new Error("Filter events kosong");
  console.log(`2. Filter events: ${filterOptions.length} event`);

  const data = await getLeaderboardData(event.id);
  if (!data) throw new Error("Leaderboard data null");

  console.log(`3. Leaderboard: ${data.totalParticipants} peserta`);

  if (data.entries.length > 0) {
    const first = data.entries[0];
    console.log(
      `   Rank 1: ${first.nama} — ${first.totalDistanceKm} km (${first.activityCount} Aktivitas)`
    );

    if (data.entries.length >= 2) {
      const a = data.entries[0];
      const b = data.entries[1];
      if (a.totalDistanceKm < b.totalDistanceKm) {
        throw new Error("Sorting by distance salah");
      }
      if (a.totalDistanceKm === b.totalDistanceKm) {
        const paceSec = (pace: string | null) => {
          if (!pace) return Number.POSITIVE_INFINITY;
          const [minutes, seconds] = pace.split(":").map(Number);
          return minutes * 60 + seconds;
        };
        if (paceSec(a.avgPacePerKm) > paceSec(b.avgPacePerKm)) {
          throw new Error("Tiebreaker pace salah");
        }
      }
    }

    for (let i = 0; i < data.entries.length; i++) {
      if (data.entries[i].rank !== i + 1) {
        throw new Error(`Rank tidak berurutan di index ${i}`);
      }
    }
  }

  const rawEntries = await getLeaderboardEntries(event.id);
  if (rawEntries.length !== data.entries.length) {
    throw new Error("Entry count mismatch");
  }

  const activityCount = await prisma.activity.count({
    where: { eventId: event.id },
  });
  console.log(`4. Total aktivitas di DB: ${activityCount}`);

  console.log("\n=== Semua test Phase 3 LULUS ===\n");
}

main()
  .catch((e) => {
    console.error("\n✗ TEST GAGAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
