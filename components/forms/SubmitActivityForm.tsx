"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { submitActivity } from "@/actions/submit-activity";
import { PixelCelebration } from "@/components/celebration/PixelCelebration";
import { ActivitySummaryCard } from "@/components/forms/ActivitySummaryCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelSelect } from "@/components/ui/PixelSelect";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { formatDateId } from "@/lib/format";
import {
  submitActivitySchema,
  type SubmitActivityInput,
} from "@/lib/validations/activity.schema";
import type { ActivitySubmitSummary } from "@/types/activity.types";

interface EventOption {
  id: string;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

interface SubmitActivityFormProps {
  events: EventOption[];
}

export function SubmitActivityForm({ events }: SubmitActivityFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [banMessage, setBanMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<ActivitySubmitSummary | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubmitActivityInput>({
    resolver: zodResolver(submitActivitySchema),
    defaultValues: {
      eventId: events[0]?.id ?? "",
      token: "",
      stravaUrl: "",
      distanceKm: undefined,
      pacePerKm: "",
      elevationM: undefined,
    },
  });

  const eventId = watch("eventId");

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === eventId) ?? events[0],
    [events, eventId]
  );

  function onSubmit(data: SubmitActivityInput) {
    setServerError(null);
    setBanMessage(null);

    startTransition(async () => {
      const result = await submitActivity({
        ...data,
        token: data.token.trim().toUpperCase(),
        distanceKm: Number(data.distanceKm),
        elevationM: Number(data.elevationM),
      });

      if (!result.success) {
        if (result.error.code === "BANNED") {
          setBanMessage(result.error.message);
          return;
        }

        setServerError(result.error.message);
        toast.error(result.error.message);
        return;
      }

      setSummary(result.data);
      setShowCelebration(true);
      setShowSummary(false);
    });
  }

  function handleCelebrationComplete() {
    setShowCelebration(false);
    setShowSummary(true);
  }

  function handleSubmitAnother() {
    setSummary(null);
    setShowSummary(false);
    reset({
      eventId: watch("eventId"),
      token: watch("token"),
      stravaUrl: "",
      distanceKm: undefined,
      pacePerKm: "",
      elevationM: undefined,
    });
  }

  if (showSummary && summary) {
    return (
      <ActivitySummaryCard
        summary={summary}
        onSubmitAnother={handleSubmitAnother}
      />
    );
  }

  return (
    <>
      <PixelCelebration
        isVisible={showCelebration}
        onComplete={handleCelebrationComplete}
      />

      {banMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="max-w-md rounded-pixel border-4 border-semantic-danger bg-bg-card p-6 shadow-pixel-lg">
            <h2 className="font-pixel text-[10px] text-semantic-danger">
              Peringatan
            </h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-text-primary">
              {banMessage}
            </p>
            <div className="mt-6 flex justify-center">
              <PixelButton onClick={() => setBanMessage(null)}>OK</PixelButton>
            </div>
          </div>
        </div>
      )}

      <PixelCard className="p-6">
        <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
          Input Aktivitas
        </h1>
        <p className="mt-2 font-pixelBody text-lg text-text-muted">
          Isi data aktivitas Anda. Admin akan memvalidasi dengan link Strava.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-4"
        >
          <PixelSelect
            label="Event"
            placeholder="Pilih event"
            options={events.map((e) => ({ value: e.id, label: e.nama }))}
            error={errors.eventId?.message}
            {...register("eventId")}
          />

          <PixelInput
            label="Token"
            placeholder="Masukkan token Anda"
            className="uppercase"
            error={errors.token?.message}
            {...register("token", {
              setValueAs: (v: string) => v.toUpperCase(),
            })}
          />

          <div className="flex flex-col gap-2">
            <PixelInput
              label="Link Activity Strava"
              type="url"
              placeholder="https://www.strava.com/activities/..."
              error={errors.stravaUrl?.message}
              {...register("stravaUrl")}
            />
            {selectedEvent && (
              <p className="animate-period-pulse rounded-pixel border-2 px-3 py-2 font-sans text-xs font-semibold md:text-sm">
                Aktivitas yang diterima dari{" "}
                {formatDateId(selectedEvent.tanggalMulai)} ke{" "}
                {formatDateId(selectedEvent.tanggalSelesai)}
              </p>
            )}
          </div>

          <PixelInput
            label="Jarak (km)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="5.25"
            error={errors.distanceKm?.message}
            {...register("distanceKm", { valueAsNumber: true })}
          />

          <PixelInput
            label="Pace (per km)"
            placeholder="5:30"
            error={errors.pacePerKm?.message}
            {...register("pacePerKm")}
          />

          <PixelInput
            label="Elevasi (meter)"
            type="number"
            step="1"
            min="0"
            placeholder="120"
            error={errors.elevationM?.message}
            {...register("elevationM", { valueAsNumber: true })}
          />

          {serverError && (
            <p className="rounded-pixel border-2 border-semantic-danger/30 bg-semantic-danger/5 px-3 py-2 font-sans text-sm text-semantic-danger">
              {serverError}
            </p>
          )}

          <PixelButton
            type="submit"
            isLoading={isPending}
            className="mt-2 w-full"
          >
            Submit Aktivitas
          </PixelButton>
        </form>
      </PixelCard>
    </>
  );
}
