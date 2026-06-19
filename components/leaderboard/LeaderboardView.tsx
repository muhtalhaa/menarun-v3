import Link from "next/link";
import { EventDescription } from "@/components/leaderboard/EventDescription";
import { EventFilter } from "@/components/leaderboard/EventFilter";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { TopThreePodium } from "@/components/leaderboard/TopThreePodium";
import { PixelButton } from "@/components/ui/PixelButton";
import type { EventFilterOption } from "@/types/event.types";
import type { LeaderboardData } from "@/types/leaderboard.types";

interface LeaderboardViewProps {
  data: LeaderboardData;
  events: EventFilterOption[];
  showCta?: boolean;
  showFullLink?: boolean;
}

export function LeaderboardView({
  data,
  events,
  showCta = false,
  showFullLink = false,
}: LeaderboardViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <EventDescription
        event={data.event}
        showInactiveBanner={!data.isEventCurrentlyActive}
      />

      {showCta && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/registrasi" className="flex-1">
            <PixelButton className="w-full">Registrasi</PixelButton>
          </Link>
          <Link href="/input" className="flex-1">
            <PixelButton variant="secondary" className="w-full">
              Input Aktivitas
            </PixelButton>
          </Link>
        </div>
      )}

      <EventFilter events={events} selectedEventId={data.event.id} />

      <TopThreePodium entries={data.entries} />

      <LeaderboardTable eventId={data.event.id} entries={data.entries} />

      {data.totalParticipants > 0 && (
        <p className="text-center font-sans text-sm text-text-muted">
          {data.totalParticipants} peserta berkompetisi
        </p>
      )}

      {showFullLink && (
        <div className="text-center">
          <Link
            href={`/leaderboard?eventId=${data.event.id}`}
            className="font-pixelBody text-lg text-tosca underline-offset-2 hover:underline"
          >
            Lihat Leaderboard Lengkap →
          </Link>
        </div>
      )}
    </div>
  );
}
