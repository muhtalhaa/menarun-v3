"use client";

import { useState, useTransition } from "react";
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
import { PixelLoader } from "@/components/ui/PixelLoader";
import {
  submitActivitySchema,
  type SubmitActivityInput,
} from "@/lib/validations/activity.schema";
import type { ActivitySubmitSummary } from "@/types/activity.types";

interface EventOption {
  id: string;
  nama: string;
}

interface SubmitActivityFormProps {
  events: EventOption[];
}

interface StravaPreview {
  distance_km: number;
  duration_sec: number;
  pace_per_km: string | null;
  activity_date: string;
  title: string | null;
  sport_type: string | null;
}

function formatPreviewDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SubmitActivityForm({ events }: SubmitActivityFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [preview, setPreview] = useState<StravaPreview | null>(null);
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
      token: "",
      stravaUrl: "",
      eventId: events[0]?.id ?? "",
    },
  });

  const stravaUrl = watch("stravaUrl");
  const eventId = watch("eventId");

  async function handlePreview() {
    if (!stravaUrl) {
      toast.error("Masukkan link Strava terlebih dahulu.");
      return;
    }

    if (!eventId) {
      toast.error("Pilih event terlebih dahulu.");
      return;
    }

    setIsPreviewing(true);
    setPreview(null);
    setServerError(null);

    try {
      const res = await fetch("/api/strava/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stravaUrl, eventId }),
      });

      const json = await res.json();

      if (!res.ok) {
        const message = json.error?.message ?? "Gagal memparse link Strava.";
        toast.error(message);
        return;
      }

      setPreview(json.data);
    } catch {
      toast.error("Gagal memparse link Strava.");
    } finally {
      setIsPreviewing(false);
    }
  }

  function onSubmit(data: SubmitActivityInput) {
    setServerError(null);
    setPreview(null);

    startTransition(async () => {
      const result = await submitActivity({
        ...data,
        token: data.token.trim().toUpperCase(),
      });

      if (!result.success) {
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
    setPreview(null);
    reset({
      token: watch("token"),
      stravaUrl: "",
      eventId: events[0]?.id ?? "",
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

      <PixelCard className="p-6">
        <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
          Input Aktivitas
        </h1>
        <p className="mt-2 font-pixelBody text-lg text-text-muted">
          Masukkan token dan link aktivitas Strava Anda.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-4"
        >
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
            <PixelButton
              type="button"
              variant="secondary"
              onClick={handlePreview}
              disabled={isPreviewing || !stravaUrl}
              className="w-full sm:w-auto"
            >
              {isPreviewing ? "Memuat..." : "Preview"}
            </PixelButton>
          </div>

          {isPreviewing && (
            <div className="flex justify-center py-2">
              <PixelLoader size="sm" />
            </div>
          )}

          {preview && (
            <div className="rounded-pixel border-2 border-tosca-muted bg-bg-toscaTint p-3 font-sans text-sm">
              <p className="font-pixelBody text-base text-tosca-dark">
                Preview Aktivitas
              </p>
              {preview.title && (
                <p className="mt-1 text-text-primary">{preview.title}</p>
              )}
              <p className="mt-1 text-text-secondary">
                {preview.distance_km.toFixed(2)} km ·{" "}
                {formatPreviewDuration(preview.duration_sec)}
                {preview.pace_per_km && ` · ${preview.pace_per_km}/km`}
              </p>
              <p className="text-text-muted">{preview.activity_date}</p>
            </div>
          )}

          <PixelSelect
            label="Event"
            placeholder="Pilih event"
            options={events.map((e) => ({ value: e.id, label: e.nama }))}
            error={errors.eventId?.message}
            {...register("eventId")}
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
