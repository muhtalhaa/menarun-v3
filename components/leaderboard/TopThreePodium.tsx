import { PixelCard } from "@/components/ui/PixelCard";
import { formatDistance } from "@/lib/format";
import type { LeaderboardEntry } from "@/types/leaderboard.types";

interface TopThreePodiumProps {
  entries: LeaderboardEntry[];
}

const PODIUM_ORDER = [1, 0, 2] as const;
const MEDALS = ["🥇", "🥈", "🥉"] as const;
const HEIGHTS = ["h-28", "h-36", "h-24"] as const;
const LABELS = ["1st", "2nd", "3rd"] as const;

export function TopThreePodium({ entries }: TopThreePodiumProps) {
  const topThree = entries.slice(0, 3);

  if (topThree.length === 0) {
    return (
      <PixelCard className="p-6 text-center">
        <p className="font-pixelBody text-xl text-text-muted">
          Belum ada aktivitas untuk event ini.
        </p>
      </PixelCard>
    );
  }

  return (
    <div className="grid grid-cols-3 items-end gap-2 md:gap-4">
      {PODIUM_ORDER.map((entryIndex, displayIndex) => {
        const entry = topThree[entryIndex];
        if (!entry) {
          return <div key={displayIndex} />;
        }

        return (
          <div
            key={entry.participantId}
            className="flex flex-col items-center"
          >
            <span className="text-2xl md:text-3xl" aria-hidden>
              {MEDALS[entryIndex]}
            </span>
            <PixelCard
              className={`${HEIGHTS[entryIndex]} mt-2 flex w-full flex-col items-center justify-end p-3 text-center`}
            >
              <p className="font-pixel text-[8px] text-tosca-dark md:text-[10px]">
                {LABELS[entryIndex]}
              </p>
              <p className="mt-1 line-clamp-2 font-sans text-xs font-semibold text-text-primary md:text-sm">
                {entry.nama}
              </p>
              <p className="mt-1 font-pixelBody text-sm text-tosca md:text-base">
                {formatDistance(entry.totalDistanceKm)}
              </p>
              <p className="font-sans text-[10px] text-text-muted md:text-xs">
                {entry.activityCount} akt.
              </p>
            </PixelCard>
          </div>
        );
      })}
    </div>
  );
}
