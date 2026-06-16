"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteParticipant } from "@/actions/participant";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelModal } from "@/components/ui/PixelModal";

interface DeleteParticipantButtonProps {
  participantId: string;
  participantName: string;
  activityCount: number;
}

export function DeleteParticipantButton({
  participantId,
  participantName,
  activityCount,
}: DeleteParticipantButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteParticipant(participantId);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success(`Akun ${participantName} berhasil dihapus.`);
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <PixelButton
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="text-[10px] !border-semantic-danger !px-2 !py-1 !text-semantic-danger"
      >
        Hapus
      </PixelButton>

      <PixelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Konfirmasi Hapus"
      >
        <p className="font-sans text-sm text-text-primary">
          {activityCount > 0 ? (
            <>
              Peserta <strong>{participantName}</strong> memiliki{" "}
              {activityCount} aktivitas. Hapus aktivitas terlebih dahulu
              sebelum menghapus akun.
            </>
          ) : (
            <>
              Hapus akun peserta <strong>{participantName}</strong> secara
              permanen? Token tidak dapat dipulihkan.
            </>
          )}
        </p>

        {activityCount === 0 && (
          <div className="mt-4 flex gap-3">
            <PixelButton
              onClick={handleConfirm}
              isLoading={isPending}
              className="!border-semantic-danger !bg-semantic-danger"
            >
              Hapus
            </PixelButton>
          </div>
        )}
      </PixelModal>
    </>
  );
}
