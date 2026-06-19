import { PixelCard } from "@/components/ui/PixelCard";
import { formatDateTimeWib } from "@/lib/format";
import type { EventReportRow } from "@/lib/activity-reports";

interface EventReportsTableProps {
  eventName: string;
  rows: EventReportRow[];
}

export function EventReportsTable({ eventName, rows }: EventReportsTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-pixelBody text-lg text-text-muted">
        {rows.length} laporan pada {eventName}
      </p>

      <PixelCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b-2 border-tosca-muted bg-bg-toscaTint">
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Tgl & Jam
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Nama Pelapor
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Token Pelapor
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Isi Laporan
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Nama Terlapor
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-secondary">
                  Token Terlapor
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-text-muted"
                  >
                    Belum ada laporan kecurangan untuk event ini.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-tosca-muted/50 align-top hover:bg-bg-toscaTint/50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                      {formatDateTimeWib(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {row.reporterNama}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs uppercase text-text-secondary">
                      {row.reporterToken}
                    </td>
                    <td className="max-w-md px-4 py-3 text-text-secondary">
                      <p className="whitespace-pre-wrap break-words">
                        {row.detail}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-semantic-danger">
                      {row.reportedNama}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs uppercase text-semantic-danger">
                      {row.reportedToken}
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
