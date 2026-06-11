import { PixelBadge } from "@/components/ui/PixelBadge";
import { PixelCard } from "@/components/ui/PixelCard";
import { formatDateId } from "@/lib/format";
import type { EventSummary } from "@/types/event.types";

interface EventDescriptionProps {
  event: EventSummary;
  showInactiveBanner?: boolean;
}

export function EventDescription({
  event,
  showInactiveBanner = false,
}: EventDescriptionProps) {
  return (
    <PixelCard className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
          {event.nama}
        </h1>
        <div className="flex gap-2">
          {event.isActive ? (
            <PixelBadge variant="success">Aktif</PixelBadge>
          ) : (
            <PixelBadge variant="default">Nonaktif</PixelBadge>
          )}
        </div>
      </div>

      <p className="mt-2 font-pixelBody text-lg text-text-secondary">
        {formatDateId(event.tanggalMulai)} – {formatDateId(event.tanggalSelesai)}
      </p>

      <p className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-primary">
        {event.deskripsi}
      </p>

      {showInactiveBanner && (
        <p className="mt-4 rounded-pixel border-2 border-semantic-warning/40 bg-semantic-warning/10 px-3 py-2 font-sans text-sm text-text-secondary">
          Tidak ada event aktif saat ini. Menampilkan event terbaru.
        </p>
      )}
    </PixelCard>
  );
}
