"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteEvent } from "@/actions/event";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelModal } from "@/components/ui/PixelModal";

interface DeleteEventButtonProps {
  eventId: string;
  eventName: string;
  hasActivities: boolean;
}

export function DeleteEventButton({
  eventId,
  eventName,
  hasActivities,
}: DeleteEventButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteEvent(eventId);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      const message = result.data.softDeleted
        ? `Event "${eventName}" dinonaktifkan (memiliki aktivitas).`
        : `Event "${eventName}" berhasil dihapus.`;

      toast.success(message);
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <PixelButton
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="!border-semantic-danger !text-semantic-danger text-[10px] !px-2 !py-1"
      >
        Hapus
      </PixelButton>

      <PixelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Konfirmasi Hapus"
      >
        <p className="font-sans text-sm text-text-primary">
          {hasActivities ? (
            <>
              Event <strong>{eventName}</strong> memiliki aktivitas terkait.
              Event akan <strong>dinonaktifkan</strong> (soft delete), bukan
              dihapus permanen.
            </>
          ) : (
            <>
              Hapus event <strong>{eventName}</strong> secara permanen?
            </>
          )}
        </p>

        <div className="mt-4 flex gap-3">
          <PixelButton
            onClick={handleConfirm}
            isLoading={isPending}
            className="!bg-semantic-danger !border-semantic-danger"
          >
            {hasActivities ? "Nonaktifkan" : "Hapus"}
          </PixelButton>
        </div>
      </PixelModal>
    </>
  );
}
