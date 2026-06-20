import Link from "next/link";
import { EventDescription } from "@/components/leaderboard/EventDescription";
import { EventFilter } from "@/components/leaderboard/EventFilter";
import { EventStatsCards } from "@/components/leaderboard/EventStatsCards";
import { LeaderboardPagination } from "@/components/leaderboard/LeaderboardPagination";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { TopThreePodium } from "@/components/leaderboard/TopThreePodium";
import { PixelButton } from "@/components/ui/PixelButton";
import { paginateLeaderboardEntries } from "@/lib/leaderboard-pagination";
import type { EventFilterOption } from "@/types/event.types";
import type { LeaderboardData } from "@/types/leaderboard.types";

interface LeaderboardViewProps {
  data: LeaderboardData;
  events: EventFilterOption[];
  page?: number;
  showCta?: boolean;
  showFullLink?: boolean;
}

export function LeaderboardView({
  data,
  events,
  page = 1,
  showCta = false,
  showFullLink = false,
}: LeaderboardViewProps) {
  const pagination = paginateLeaderboardEntries(data.entries, page);

  return (
    <div className="flex flex-col gap-6">
      <EventDescription
        event={data.event}
        showInactiveBanner={!data.isEventCurrentlyActive}
      />

      {showCta && (
        <EventStatsCards
          event={data.event}
          totalParticipants={data.totalParticipants}
          totalDistanceKm={data.totalDistanceKm}
        />
      )}

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

      <LeaderboardTable
        eventId={data.event.id}
        entries={pagination.items}
      />

      <LeaderboardPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />

      {!showCta && data.totalParticipants > 0 && (
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
