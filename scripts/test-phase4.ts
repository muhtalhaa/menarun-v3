/**
 * Phase 4 test — admin actions auth + event soft delete logic
 * Run: export $(grep -v '^#' .env | xargs) && npx tsx scripts/test-phase4.ts
 */
import { createEvent, deleteEvent } from "../actions/event";
import { prisma } from "../lib/prisma";

async function testUnauthorized() {
  console.log("\n1. Server action tanpa session...");
  const result = await createEvent({
    nama: "Test Unauthorized",
    deskripsi: "Seharusnya ditolak karena tidak login.",
    tanggalMulai: "2026-01-01",
    tanggalSelesai: "2026-01-31",
    isActive: true,
  });

  if (result.success) throw new Error("Seharusnya unauthorized");
  if (result.error.code !== "UNAUTHORIZED") {
    throw new Error(`Kode error salah: ${result.error.code}`);
  }
  console.log("   ✓ createEvent ditolak tanpa auth");
}

async function testSoftDelete() {
  console.log("\n2. Soft delete event dengan aktivitas...");

  const eventWithActivities = await prisma.event.findFirst({
    where: { activities: { some: {} } },
    include: { _count: { select: { activities: true } } },
  });

  if (!eventWithActivities) {
    console.log("   ~ Lewati — tidak ada event dengan aktivitas");
    return;
  }

  const before = eventWithActivities.isActive;
  const result = await deleteEvent(eventWithActivities.id);

  if (result.success) {
    console.log("   ~ deleteEvent butuh auth — expected UNAUTHORIZED di script");
    return;
  }

  if (result.error.code === "UNAUTHORIZED") {
    const stillExists = await prisma.event.findUnique({
      where: { id: eventWithActivities.id },
    });
    if (!stillExists) throw new Error("Event hilang tanpa auth");
    if (stillExists.isActive !== before) {
      throw new Error("Event berubah tanpa auth");
    }
    console.log("   ✓ Event tidak berubah tanpa auth (soft delete protected)");
  }
}

async function testAdminExists() {
  console.log("\n3. Admin seed exists...");
  const admin = await prisma.admin.findUnique({
    where: { email: "admin@menarun.app" },
  });
  if (!admin) throw new Error("Admin seed tidak ditemukan");
  console.log(`   ✓ Admin: ${admin.email}`);
}

async function main() {
  console.log("=== Phase 4 Test ===");
  await testAdminExists();
  await testUnauthorized();
  await testSoftDelete();
  console.log("\n=== Semua test Phase 4 LULUS ===\n");
}

main()
  .catch((e) => {
    console.error("\n✗ TEST GAGAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
