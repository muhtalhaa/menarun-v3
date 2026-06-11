import Link from "next/link";
import { DeleteEventButton } from "@/components/admin/DeleteEventButton";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { formatDateId } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEventPage() {
  const events = await prisma.event.findMany({
    orderBy: { tanggalMulai: "desc" },
    include: {
      _count: { select: { activities: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
            Kelola Event
          </h1>
          <p className="mt-2 font-pixelBody text-lg text-text-muted">
            {events.length} event
          </p>
        </div>
        <Link href="/admin/event/baru">
          <PixelButton>+ Buat Event</PixelButton>
        </Link>
      </div>

      <PixelCard className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b-2 border-tosca-muted bg-bg-toscaTint">
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Nama
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Periode
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">
                  Aktivitas
                </th>
                <th className="px-4 py-3 text-right font-semibold text-text-secondary">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-text-muted"
                  >
                    Belum ada event.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-tosca-muted/50 hover:bg-bg-toscaTint/50"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {event.nama}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatDateId(event.tanggalMulai)} –{" "}
                      {formatDateId(event.tanggalSelesai)}
                    </td>
                    <td className="px-4 py-3">
                      {event.isActive ? (
                        <PixelBadge variant="success">Aktif</PixelBadge>
                      ) : (
                        <PixelBadge variant="default">Nonaktif</PixelBadge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {event._count.activities}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/event/${event.id}/edit`}>
                          <PixelButton
                            variant="secondary"
                            className="text-[10px] !px-2 !py-1"
                          >
                            Edit
                          </PixelButton>
                        </Link>
                        <DeleteEventButton
                          eventId={event.id}
                          eventName={event.nama}
                          hasActivities={event._count.activities > 0}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PixelCard>
    </div>
  );
}
