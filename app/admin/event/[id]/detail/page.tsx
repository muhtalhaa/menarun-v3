import Link from "next/link";
import { notFound } from "next/navigation";
import { EventActivitiesTable } from "@/components/admin/EventActivitiesTable";
import { PixelButton } from "@/components/ui/PixelButton";
import { formatDateId } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventDetailPage({ params }: PageProps) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      nama: true,
      tanggalMulai: true,
      tanggalSelesai: true,
      isActive: true,
    },
  });

  if (!event) notFound();

  const activities = await prisma.activity.findMany({
    where: { eventId: id },
    orderBy: { submittedAt: "desc" },
    include: {
      participant: {
        select: { nama: true, noAims: true },
      },
    },
  });

  const rows = activities.map((activity) => ({
    id: activity.id,
    submittedAt: activity.submittedAt.toISOString(),
    nama: activity.participant.nama,
    noAims: activity.participant.noAims,
    distanceKm: Number(activity.distanceKm),
    pacePerKm: activity.pacePerKm,
    elevationM: activity.elevationM,
    stravaUrl: activity.stravaUrl,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
            Detail Event
          </h1>
          <p className="mt-2 font-pixelBody text-xl text-text-primary">
            {event.nama}
          </p>
          <p className="mt-1 font-sans text-sm text-text-muted">
            {formatDateId(event.tanggalMulai)} –{" "}
            {formatDateId(event.tanggalSelesai)}
            {event.isActive ? " · Aktif" : " · Nonaktif"}
          </p>
        </div>
        <Link href="/admin/event">
          <PixelButton variant="secondary">← Kembali</PixelButton>
        </Link>
      </div>

      <div className="mt-6">
        <EventActivitiesTable
          eventId={event.id}
          eventName={event.nama}
          rows={rows}
        />
      </div>
    </div>
  );
}
