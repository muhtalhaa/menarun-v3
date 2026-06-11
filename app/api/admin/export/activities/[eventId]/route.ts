import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { auth } from "@/lib/auth";
import { formatDateTimeWib } from "@/lib/format";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await context.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { nama: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const activities = await prisma.activity.findMany({
    where: { eventId },
    orderBy: { submittedAt: "asc" },
    include: {
      participant: {
        select: { nama: true, noAims: true, token: true },
      },
    },
  });

  const sheetRows = activities.map((activity, index) => ({
    No: index + 1,
    "Waktu Input (WIB)": formatDateTimeWib(activity.submittedAt),
    Nama: activity.participant.nama,
    AIMS: activity.participant.noAims,
    Token: activity.participant.token,
    "Jarak (km)": Number(activity.distanceKm),
    "Pace (/km)": activity.pacePerKm ?? "",
    "Elevasi (m)": activity.elevationM,
    "Link Strava": activity.stravaUrl,
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Aktivitas");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const safeName = event.nama.replace(/[^a-zA-Z0-9-_]+/g, "_").slice(0, 40);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="menarun-aktivitas-${safeName}.xlsx"`,
    },
  });
}
