"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEvent, updateEvent } from "@/actions/event";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { eventSchema, type EventInput } from "@/lib/validations/event.schema";

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  defaultValues?: EventInput;
}

export function EventForm({ mode, eventId, defaultValues }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultValues ?? {
      nama: "",
      deskripsi: "",
      tanggalMulai: "",
      tanggalSelesai: "",
      isActive: true,
    },
  });

  function onSubmit(data: EventInput) {
    setServerError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEvent(data)
          : await updateEvent(eventId!, data);

      if (!result.success) {
        setServerError(result.error.message);
        toast.error(result.error.message);
        return;
      }

      toast.success(
        mode === "create" ? "Event berhasil dibuat." : "Event berhasil diperbarui."
      );
      router.push("/admin/event");
      router.refresh();
    });
  }

  return (
    <PixelCard className="p-6">
      <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
        {mode === "create" ? "Buat Event Baru" : "Edit Event"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <PixelInput
          label="Nama Event"
          placeholder="Lomba Lari Ramadhan 2026"
          error={errors.nama?.message}
          {...register("nama")}
        />

        <PixelInput
          label="Tanggal Mulai"
          type="date"
          error={errors.tanggalMulai?.message}
          {...register("tanggalMulai")}
        />

        <PixelInput
          label="Tanggal Selesai"
          type="date"
          error={errors.tanggalSelesai?.message}
          {...register("tanggalSelesai")}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="deskripsi"
            className="font-pixelBody text-lg text-text-secondary"
          >
            Deskripsi
          </label>
          <textarea
            id="deskripsi"
            rows={5}
            className="pixel-focus rounded-pixel border-2 border-tosca-muted bg-bg-card px-3 py-2 font-sans text-text-primary focus:border-tosca focus:shadow-pixel-glow"
            placeholder="Deskripsi event untuk peserta..."
            {...register("deskripsi")}
          />
          {errors.deskripsi?.message && (
            <p className="font-sans text-sm text-semantic-danger">
              {errors.deskripsi.message}
            </p>
          )}
        </div>

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-3 font-sans text-sm text-text-primary">
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="pixel-focus h-4 w-4 accent-tosca"
              />
              Event aktif
            </label>
          )}
        />

        {serverError && (
          <p className="rounded-pixel border-2 border-semantic-danger/30 bg-semantic-danger/5 px-3 py-2 font-sans text-sm text-semantic-danger">
            {serverError}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <PixelButton type="submit" isLoading={isPending}>
            {mode === "create" ? "Buat Event" : "Simpan Perubahan"}
          </PixelButton>
          <PixelButton
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/event")}
          >
            Batal
          </PixelButton>
        </div>
      </form>
    </PixelCard>
  );
}
