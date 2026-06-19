import Link from "next/link";
import { notFound } from "next/navigation";
import { EventReportsTable } from "@/components/admin/EventReportsTable";
import { PixelButton } from "@/components/ui/PixelButton";
import { getEventReports } from "@/lib/activity-reports";
import { formatDateId } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventLaporanPage({ params }: PageProps) {
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

  const rows = await getEventReports(id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
            Laporan Kecurangan
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
        <EventReportsTable eventName={event.nama} rows={rows} />
      </div>
    </div>
  );
}
