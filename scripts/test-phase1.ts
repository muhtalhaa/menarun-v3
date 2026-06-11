/**
 * Phase 1 E2E test — registrasi + recovery flow
 * Run: npx tsx scripts/test-phase1.ts
 */
import { recoverToken } from "../actions/recover-token";
import { registerParticipant } from "../actions/register-participant";
import { prisma } from "../lib/prisma";

const TEST_AIMS = "99001";
const TEST_EMAIL = "test.phase1@menarun.app";

async function cleanup() {
  await prisma.participant.deleteMany({
    where: { noAims: TEST_AIMS },
  });
}

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

async function testRegistration() {
  console.log("\n1. Registrasi peserta baru...");

  try {
    await registerParticipant({
      nama: "Ahmad Test",
      noAims: TEST_AIMS,
      majlis: "Jakarta Pusat",
      email: TEST_EMAIL,
      usia: 25,
      noHp: "081234567890",
    });
    throw new Error("Seharusnya redirect, bukan return");
  } catch (error) {
    if (!isRedirectError(error)) throw error;
  }

  const participant = await prisma.participant.findUnique({
    where: { noAims: TEST_AIMS },
  });

  if (!participant) throw new Error("Peserta tidak tersimpan di DB");
  if (participant.token.length !== 8) throw new Error("Token harus 8 karakter");
  if (participant.nama !== "Ahmad Test") throw new Error("Nama tidak cocok");

  console.log(`   ✓ Registrasi berhasil — token: ${participant.token}`);
  return participant.token;
}

async function testDuplicateAims() {
  console.log("\n2. Coba registrasi AIMS duplikat...");

  const result = await registerParticipant({
    nama: "Budi Duplikat",
    noAims: TEST_AIMS,
    majlis: "Jakarta Pusat",
    email: "lain@menarun.app",
    usia: 30,
    noHp: "081111111111",
  });

  if (result.success) throw new Error("Duplikat AIMS seharusnya ditolak");
  if (result.error.code !== "DUPLICATE_AIMS") {
    throw new Error(`Kode error salah: ${result.error.code}`);
  }
  if (!result.error.message.includes(TEST_AIMS)) {
    throw new Error("Pesan error tidak menyebut AIMS");
  }

  console.log("   ✓ Duplikat AIMS ditolak dengan pesan Indonesia");
}

async function testTokenRecovery(token: string) {
  console.log("\n3. Recovery token (AIMS + email)...");

  const success = await recoverToken({
    noAims: TEST_AIMS,
    email: TEST_EMAIL,
  });

  if (!success.success) throw new Error("Recovery gagal: " + success.error.message);
  if (success.data.token !== token) {
    throw new Error(`Token recovery tidak cocok: ${success.data.token} vs ${token}`);
  }

  console.log(`   ✓ Token recovery berhasil — token: ${success.data.token}`);
}

async function testRecoveryWrongData() {
  console.log("\n4. Recovery dengan data salah...");

  const result = await recoverToken({
    noAims: TEST_AIMS,
    email: "salah@menarun.app",
  });

  if (result.success) throw new Error("Recovery salah seharusnya gagal");
  if (result.error.code !== "TOKEN_NOT_FOUND") {
    throw new Error(`Kode error salah: ${result.error.code}`);
  }

  console.log("   ✓ Recovery gagal dengan pesan Indonesia");
}

async function main() {
  console.log("=== Phase 1 E2E Test ===");

  await cleanup();
  const token = await testRegistration();
  await testDuplicateAims();
  await testTokenRecovery(token);
  await testRecoveryWrongData();

  console.log("\n=== Semua test Phase 1 LULUS ===\n");
}

main()
  .catch((e) => {
    console.error("\n✗ TEST GAGAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
