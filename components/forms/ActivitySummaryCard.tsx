import Link from "next/link";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { formatDistance } from "@/lib/format";
import type { ActivitySubmitSummary } from "@/types/activity.types";

interface ActivitySummaryCardProps {
  summary: ActivitySubmitSummary;
  onSubmitAnother?: () => void;
}

export function ActivitySummaryCard({
  summary,
  onSubmitAnother,
}: ActivitySummaryCardProps) {
  return (
    <PixelCard className="p-6">
      <h2 className="font-pixel text-xs text-tosca-dark md:text-sm">
        Aktivitas Tersimpan!
      </h2>

      <div className="mt-4 space-y-2 font-sans text-sm text-text-primary">
        <p>
          <span className="text-text-muted">Nama:</span> {summary.nama}
        </p>
        <p>
          <span className="text-text-muted">Jarak:</span>{" "}
          {formatDistance(summary.distanceKm)}
        </p>
        <p>
          <span className="text-text-muted">Durasi:</span> {summary.duration}
        </p>
        {summary.pace && (
          <p>
            <span className="text-text-muted">Pace:</span> {summary.pace} /km
          </p>
        )}
      </div>

      <p className="mt-4 font-pixelBody text-lg text-tosca-dark">
        Aktivitas berhasil disimpan. Sisa kuota hari ini:{" "}
        {summary.sisaKuotaHariIni} aktivitas.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {onSubmitAnother && (
          <PixelButton onClick={onSubmitAnother} className="w-full sm:w-auto">
            Submit Lagi
          </PixelButton>
        )}
        <Link href="/">
          <PixelButton variant="secondary" className="w-full sm:w-auto">
            Kembali ke Beranda
          </PixelButton>
        </Link>
      </div>
    </PixelCard>
  );
}
