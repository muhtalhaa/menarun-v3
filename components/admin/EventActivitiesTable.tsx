"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteActivity, updateActivity } from "@/actions/activity";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { formatDateTimeWib } from "@/lib/format";

export interface EventActivityRow {
  id: string;
  submittedAt: string;
  nama: string;
  noAims: string;
  distanceKm: number;
  pacePerKm: string | null;
  elevationM: number;
  stravaUrl: string;
}

interface EventActivitiesTableProps {
  eventId: string;
  eventName: string;
  rows: EventActivityRow[];
}

interface EditState {
  id: string;
  stravaUrl: string;
  distanceKm: string;
  pacePerKm: string;
  elevationM: string;
}

export function EventActivitiesTable({
  eventId,
  eventName,
  rows,
}: EventActivitiesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editState, setEditState] = useState<EditState | null>(null);

  const exportUrl = useMemo(
    () => `/api/admin/export/activities/${eventId}`,
    [eventId]
  );

  function openEdit(row: EventActivityRow) {
    setEditState({
      id: row.id,
      stravaUrl: row.stravaUrl,
      distanceKm: row.distanceKm.toFixed(2),
      pacePerKm: row.pacePerKm ?? "",
      elevationM: String(row.elevationM),
    });
  }

  function handleSaveEdit() {
    if (!editState) return;

    startTransition(async () => {
      const result = await updateActivity({
        activityId: editState.id,
        stravaUrl: editState.stravaUrl,
        distanceKm: Number(editState.distanceKm),
        pacePerKm: editState.pacePerKm,
        elevationM: Number(editState.elevationM),
      });

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Aktivitas berhasil diperbarui.");
      router.refresh();
      setEditState(null);
    });
  }

  function handleDelete(activityId: string) {
    if (!confirm("Hapus aktivitas ini?")) return;

    startTransition(async () => {
      const result = await deleteActivity(activityId);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Aktivitas dihapus.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-pixelBody text-lg text-text-muted">
          {rows.length} aktivitas pada {eventName}
        </p>
        <a href={exportUrl}>
          <PixelButton variant="secondary">Export Excel</PixelButton>
        </a>
      </div>

      <PixelCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b-2 border-tosca-muted bg-bg-toscaTint">
                <th className="px-3 py-2 text-left font-semibold">No.</th>
                <th className="px-3 py-2 text-left font-semibold">Waktu Input</th>
                <th className="px-3 py-2 text-left font-semibold">Nama</th>
                <th className="px-3 py-2 text-left font-semibold">AIMS</th>
                <th className="px-3 py-2 text-right font-semibold">Jarak</th>
                <th className="px-3 py-2 text-left font-semibold">Pace</th>
                <th className="px-3 py-2 text-right font-semibold">Elevasi</th>
                <th className="px-3 py-2 text-left font-semibold">Link Strava</th>
                <th className="px-3 py-2 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-8 text-center text-text-muted"
                  >
                    Belum ada aktivitas untuk event ini.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-tosca-muted/50 hover:bg-bg-toscaTint/50"
                  >
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDateTimeWib(row.submittedAt)}
                    </td>
                    <td className="px-3 py-2">{row.nama}</td>
                    <td className="px-3 py-2">{row.noAims}</td>
                    <td className="px-3 py-2 text-right">
                      {row.distanceKm.toFixed(2)} km
                    </td>
                    <td className="px-3 py-2">
                      {row.pacePerKm ? `${row.pacePerKm}/km` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">{row.elevationM} m</td>
                    <td className="max-w-[160px] truncate px-3 py-2">
                      <a
                        href={row.stravaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-tosca underline-offset-2 hover:underline"
                      >
                        Buka
                      </a>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <PixelButton
                          variant="secondary"
                          className="text-[10px] !px-2 !py-1"
                          onClick={() => openEdit(row)}
                        >
                          Edit
                        </PixelButton>
                        <PixelButton
                          variant="secondary"
                          className="text-[10px] !px-2 !py-1 !text-semantic-danger"
                          onClick={() => handleDelete(row.id)}
                          disabled={isPending}
                        >
                          Hapus
                        </PixelButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PixelCard>

      {editState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4">
          <PixelCard className="w-full max-w-lg p-6">
            <h2 className="font-pixel text-[10px] text-tosca-dark">Edit Aktivitas</h2>
            <div className="mt-4 flex flex-col gap-3">
              <PixelInput
                label="Link Strava"
                value={editState.stravaUrl}
                onChange={(e) =>
                  setEditState({ ...editState, stravaUrl: e.target.value })
                }
              />
              <PixelInput
                label="Jarak (km)"
                type="number"
                step="0.01"
                value={editState.distanceKm}
                onChange={(e) =>
                  setEditState({ ...editState, distanceKm: e.target.value })
                }
              />
              <PixelInput
                label="Pace (per km)"
                value={editState.pacePerKm}
                onChange={(e) =>
                  setEditState({ ...editState, pacePerKm: e.target.value })
                }
              />
              <PixelInput
                label="Elevasi (meter)"
                type="number"
                value={editState.elevationM}
                onChange={(e) =>
                  setEditState({ ...editState, elevationM: e.target.value })
                }
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <PixelButton
                variant="secondary"
                onClick={() => setEditState(null)}
                disabled={isPending}
              >
                Batal
              </PixelButton>
              <PixelButton onClick={handleSaveEdit} isLoading={isPending}>
                Simpan
              </PixelButton>
            </div>
          </PixelCard>
        </div>
      )}
    </div>
  );
}
