import Link from "next/link";
import { ParticipantReportSection } from "@/components/leaderboard/ReportCheatingDialog";
import { PixelCard } from "@/components/ui/PixelCard";
import { formatDateId, formatDateTimeWib, formatDistance } from "@/lib/format";
import type { ParticipantEventDetail } from "@/types/participant-public.types";

interface ParticipantDetailViewProps {
  detail: ParticipantEventDetail;
}

export function ParticipantDetailView({ detail }: ParticipantDetailViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/leaderboard?eventId=${detail.event.id}`}
            className="font-pixelBody text-lg text-tosca underline-offset-2 hover:underline"
          >
            ← Kembali ke Leaderboard
          </Link>
          <h1 className="mt-4 font-pixel text-xs text-tosca-dark md:text-sm">
            Detail Aktivitas Peserta
          </h1>
          <p className="mt-2 font-pixelBody text-xl text-text-primary">
            {detail.nama}
          </p>
          <p className="mt-1 font-sans text-sm text-text-muted">
            {detail.majlis}
          </p>
          <p className="mt-1 font-sans text-sm text-text-secondary">
            Event: {detail.event.nama}
          </p>
        </div>

        <ParticipantReportSection
          eventId={detail.event.id}
          reportedParticipantId={detail.participantId}
          reportedParticipantName={detail.nama}
        />
      </div>

      <PixelCard className="p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="font-sans text-xs text-text-muted">Peringkat</p>
            <p className="font-pixel text-[10px] text-tosca-dark">
              {detail.rank ? `#${detail.rank}` : "–"}
            </p>
          </div>
          <div>
            <p className="font-sans text-xs text-text-muted">Total Jarak</p>
            <p className="font-sans text-sm font-medium text-text-primary">
              {formatDistance(detail.totalDistanceKm)}
            </p>
          </div>
          <div>
            <p className="font-sans text-xs text-text-muted">Jumlah Aktivitas</p>
            <p className="font-sans text-sm font-medium text-text-primary">
              {detail.activityCount}
            </p>
          </div>
          <div>
            <p className="font-sans text-xs text-text-muted">Periode Event</p>
            <p className="font-sans text-xs text-text-secondary">
              {formatDateId(detail.event.tanggalMulai)} –{" "}
              {formatDateId(detail.event.tanggalSelesai)}
            </p>
          </div>
        </div>
      </PixelCard>

      <PixelCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b-2 border-tosca-muted bg-bg-toscaTint">
                <th className="px-3 py-2 text-left font-semibold text-text-secondary">
                  #
                </th>
                <th className="px-3 py-2 text-left font-semibold text-text-secondary">
                  Tanggal Aktivitas
                </th>
                <th className="px-3 py-2 text-left font-semibold text-text-secondary">
                  Waktu Submit
                </th>
                <th className="px-3 py-2 text-right font-semibold text-text-secondary">
                  Jarak
                </th>
                <th className="px-3 py-2 text-right font-semibold text-text-secondary">
                  Pace
                </th>
                <th className="px-3 py-2 text-right font-semibold text-text-secondary">
                  Elevasi
                </th>
                <th className="px-3 py-2 text-left font-semibold text-text-secondary">
                  Link Strava
                </th>
              </tr>
            </thead>
            <tbody>
              {detail.activities.map((activity, index) => (
                <tr
                  key={activity.id}
                  className="border-b border-tosca-muted/50 hover:bg-bg-toscaTint/50"
                >
                  <td className="px-3 py-2.5 font-pixel text-[10px] text-tosca-dark">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">
                    {formatDateId(activity.activityDate)}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-text-secondary">
                    {formatDateTimeWib(activity.submittedAt)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-tosca-dark">
                    {formatDistance(activity.distanceKm)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-text-muted">
                    {activity.pacePerKm ? `${activity.pacePerKm}/km` : "–"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-text-secondary">
                    {activity.elevationM} m
                  </td>
                  <td className="max-w-[200px] px-3 py-2.5">
                    <a
                      href={activity.stravaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-tosca underline-offset-2 hover:underline"
                    >
                      {activity.stravaUrl}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PixelCard>

      <p className="font-sans text-xs text-text-muted">
        Semua link Strava di halaman ini dapat diakses publik untuk
        verifikasi antar peserta.
      </p>
    </div>
  );
}
