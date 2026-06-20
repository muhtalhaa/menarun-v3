import { EventCountdown } from "@/components/leaderboard/EventCountdown";
import { PixelCard } from "@/components/ui/PixelCard";
import { getCountdownParts } from "@/lib/countdown";
import { getEventEndDateTime } from "@/lib/events";
import { formatDistance, formatNumberId } from "@/lib/format";
import type { EventSummary } from "@/types/event.types";

interface EventStatsCardsProps {
  event: EventSummary;
  totalParticipants: number;
  totalDistanceKm: number;
}

export function EventStatsCards({
  event,
  totalParticipants,
  totalDistanceKm,
}: EventStatsCardsProps) {
  const endTime = getEventEndDateTime(event.tanggalSelesai);
  const initialParts = getCountdownParts(endTime);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <PixelCard className="flex flex-col items-center justify-center p-4 text-center">
        <p className="font-sans text-xs text-text-muted">Peserta Berkompetisi</p>
        <p className="mt-2 font-pixel text-sm text-tosca-dark md:text-base">
          {formatNumberId(totalParticipants)}
        </p>
      </PixelCard>

      <PixelCard className="flex flex-col items-center justify-center p-4 text-center">
        <p className="font-sans text-xs text-text-muted">Total Jarak</p>
        <p className="mt-2 font-pixel text-sm text-tosca-dark md:text-base">
          {formatDistance(totalDistanceKm)}
        </p>
      </PixelCard>

      <PixelCard className="flex flex-col items-center justify-center p-4 text-center">
        <p className="font-sans text-xs text-text-muted">
          Event Berakhir Dalam
        </p>
        <div className="mt-2">
          <EventCountdown
            endTimeIso={endTime.toISOString()}
            initialParts={initialParts}
          />
        </div>
      </PixelCard>
    </div>
  );
}
