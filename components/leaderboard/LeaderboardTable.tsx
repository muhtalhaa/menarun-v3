import Link from "next/link";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { formatDistance } from "@/lib/format";
import type { LeaderboardEntry } from "@/types/leaderboard.types";

interface LeaderboardTableProps {
  eventId: string;
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ eventId, entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <PixelCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse font-sans text-sm">
          <thead>
            <tr className="border-b-2 border-tosca-muted bg-bg-toscaTint">
              <th className="px-3 py-2 text-left font-semibold text-text-secondary">
                #
              </th>
              <th className="px-3 py-2 text-left font-semibold text-text-secondary">
                Nama
              </th>
              <th className="px-3 py-2 text-left font-semibold text-text-secondary">
                Majlis
              </th>
              <th className="px-3 py-2 text-right font-semibold text-text-secondary">
                Jarak
              </th>
              <th className="px-3 py-2 text-right font-semibold text-text-secondary">
                Akt.
              </th>
              <th className="px-3 py-2 text-right font-semibold text-text-secondary">
                Pace
              </th>
              <th className="px-3 py-2 text-right font-semibold text-text-secondary">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.participantId}
                className="border-b border-tosca-muted/50 transition hover:bg-bg-toscaTint/50"
              >
                <td className="px-3 py-2.5 font-pixel text-[10px] text-tosca-dark">
                  {entry.rank}
                </td>
                <td className="px-3 py-2.5 font-medium text-text-primary">
                  {entry.nama}
                </td>
                <td className="max-w-[140px] truncate px-3 py-2.5 text-text-secondary">
                  {entry.majlis}
                </td>
                <td className="px-3 py-2.5 text-right font-medium text-tosca-dark">
                  {formatDistance(entry.totalDistanceKm)}
                </td>
                <td className="px-3 py-2.5 text-right text-text-secondary">
                  {entry.activityCount}
                </td>
                <td className="px-3 py-2.5 text-right text-text-muted">
                  {entry.avgPacePerKm ? `${entry.avgPacePerKm}/km` : "–"}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Link
                    href={`/leaderboard/${eventId}/peserta/${entry.participantId}`}
                  >
                    <PixelButton
                      variant="secondary"
                      className="text-[10px] !px-2 !py-1"
                    >
                      Detail
                    </PixelButton>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PixelCard>
  );
}
