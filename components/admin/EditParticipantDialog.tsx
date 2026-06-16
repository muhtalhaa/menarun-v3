"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateParticipant } from "@/actions/participant";
import { MajlisSelect } from "@/components/forms/MajlisSelect";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { normalizePhone } from "@/lib/format";

interface EditParticipantData {
  id: string;
  token: string;
  nama: string;
  noAims: string;
  majlis: string;
  email: string;
  usia: number;
  noHp: string;
}

interface EditParticipantDialogProps {
  participant: EditParticipantData;
  majlisOptions: string[];
  onClose: () => void;
}

export function EditParticipantDialog({
  participant,
  majlisOptions,
  onClose,
}: EditParticipantDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nama, setNama] = useState(participant.nama);
  const [noAims, setNoAims] = useState(participant.noAims);
  const [majlis, setMajlis] = useState(participant.majlis);
  const [email, setEmail] = useState(participant.email);
  const [usia, setUsia] = useState(String(participant.usia));
  const [noHp, setNoHp] = useState(participant.noHp);

  const options = majlisOptions.includes(participant.majlis)
    ? majlisOptions
    : [participant.majlis, ...majlisOptions];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateParticipant(participant.id, {
        nama,
        noAims,
        majlis,
        email,
        usia: Number(usia),
        noHp: normalizePhone(noHp),
      });

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(`Data ${nama} berhasil diperbarui.`);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4">
      <PixelCard className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
        <h2 className="font-pixel text-[10px] text-tosca-dark">Edit Peserta</h2>
        <p className="mt-2 font-sans text-xs text-text-muted">
          Token: <span className="font-mono">{participant.token}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <PixelInput
            label="Nama Lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
          <PixelInput
            label="No. AIMS"
            value={noAims}
            onChange={(e) => setNoAims(e.target.value)}
            maxLength={5}
            inputMode="numeric"
            required
          />
          <MajlisSelect
            options={options}
            value={majlis}
            onChange={setMajlis}
          />
          <PixelInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PixelInput
            label="Usia"
            type="number"
            min={10}
            max={99}
            value={usia}
            onChange={(e) => setUsia(e.target.value)}
            required
          />
          <PixelInput
            label="No. HP"
            type="tel"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
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
              Simpan
            </PixelButton>
          </div>
        </form>
      </PixelCard>
    </div>
  );
}
