import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  const majlisPath = join(process.cwd(), "data", "majlis.json");
  const majlisNames: string[] = JSON.parse(readFileSync(majlisPath, "utf-8"));

  console.log(`Seeding ${majlisNames.length} majlis...`);

  for (const nama of majlisNames) {
    await prisma.majlis.upsert({
      where: { nama },
      update: { isActive: true },
      create: { nama, isActive: true },
    });
  }

  const passwordHash = await bcrypt.hash("Admin123!", 12);

  await prisma.admin.upsert({
    where: { email: "admin@menarun.app" },
    update: {},
    create: {
      email: "admin@menarun.app",
      passwordHash,
      nama: "Super Admin",
    },
  });

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);

  const demoEvent = await prisma.event.findFirst({
    where: { nama: "Event Demo menaRun" },
  });

  if (!demoEvent) {
    await prisma.event.create({
      data: {
        nama: "Event Demo menaRun",
        deskripsi:
          "Event demo untuk testing platform menaRun. Silakan registrasi dan submit aktivitas lari Anda.",
        tanggalMulai: today,
        tanggalSelesai: endDate,
        jamMulaiSubmit: "06:00",
        jamBatasSubmit: "22:00",
        isActive: true,
      },
    });
  }

  console.log("Seed selesai.");
  console.log("  Admin: admin@menarun.app / Admin123!");
  console.log("  Event: Event Demo menaRun");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
