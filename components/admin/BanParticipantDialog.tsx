"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { banParticipant } from "@/actions/ban";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelSelect } from "@/components/ui/PixelSelect";

interface EventOption {
  id: string;
  nama: string;
}

interface BanParticipantDialogProps {
  participantId: string;
  participantName: string;
  events: EventOption[];
  onClose: () => void;
}

export function BanParticipantDialog({
  participantId,
  participantName,
  events,
  onClose,
}: BanParticipantDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = await banParticipant({
        participantId,
        eventId,
        tanggalMulai,
        tanggalSelesai,
      });

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(`Peserta ${participantName} berhasil di-ban.`);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4">
      <PixelCard className="w-full max-w-md p-6">
        <h2 className="font-pixel text-[10px] text-tosca-dark">Ban Peserta</h2>
        <p className="mt-2 font-sans text-sm text-text-muted">{participantName}</p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <PixelSelect
            label="Event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            options={events.map((event) => ({
              value: event.id,
              label: event.nama,
            }))}
          />
          <PixelInput
            label="Tanggal mulai ban"
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            required
          />
          <PixelInput
            label="Tanggal selesai ban"
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
            required
          />

          <div className="mt-2 flex justify-end gap-2">
            <PixelButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </PixelButton>
            <PixelButton type="submit" isLoading={isPending}>
              Ban
            </PixelButton>
          </div>
        </form>
      </PixelCard>
    </div>
  );
}
