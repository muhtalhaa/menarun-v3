"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { reportParticipantActivity } from "@/actions/report-activity";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelInput } from "@/components/ui/PixelInput";
import {
  reportActivitySchema,
  type ReportActivityInput,
} from "@/lib/validations/report.schema";

interface ReportCheatingDialogProps {
  eventId: string;
  reportedParticipantId: string;
  reportedParticipantName: string;
  onClose: () => void;
}

export function ReportCheatingDialog({
  eventId,
  reportedParticipantId,
  reportedParticipantName,
  onClose,
}: ReportCheatingDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportActivityInput>({
    resolver: zodResolver(reportActivitySchema),
    defaultValues: {
      eventId,
      reportedParticipantId,
      token: "",
      detail: "",
    },
  });

  function onSubmit(data: ReportActivityInput) {
    setServerError(null);

    startTransition(async () => {
      const result = await reportParticipantActivity({
        ...data,
        token: data.token.trim().toUpperCase(),
      });

      if (!result.success) {
        setServerError(result.error.message);
        toast.error(result.error.message);
        return;
      }

      toast.success("Laporan kecurangan berhasil dikirim. Terima kasih.");
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
    >
      <PixelCard className="w-full max-w-md p-6">
        <h2
          id="report-dialog-title"
          className="font-pixel text-[10px] text-semantic-danger"
        >
          Laporkan Kecurangan
        </h2>
        <p className="mt-2 font-sans text-sm text-text-muted">
          Laporkan aktivitas mencurigakan dari{" "}
          <span className="font-medium text-text-primary">
            {reportedParticipantName}
          </span>
          . Admin akan meninjau laporan Anda.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col gap-3"
        >
          <input type="hidden" {...register("eventId")} />
          <input type="hidden" {...register("reportedParticipantId")} />

          <PixelInput
            label="Token Anda"
            placeholder="Masukkan token Anda"
            className="uppercase"
            error={errors.token?.message}
            {...register("token", {
              setValueAs: (v: string) => v.toUpperCase(),
            })}
          />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="detail"
              className="font-pixelBody text-lg text-text-secondary"
            >
              Detail Laporan
            </label>
            <textarea
              id="detail"
              rows={5}
              className="pixel-focus rounded-pixel border-2 border-tosca-muted bg-bg-card px-3 py-2 font-sans text-text-primary focus:border-tosca focus:shadow-pixel-glow"
              placeholder="Jelaskan kecurangan yang Anda temukan..."
              {...register("detail")}
            />
            {errors.detail?.message && (
              <p className="font-sans text-sm text-semantic-danger">
                {errors.detail.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-pixel border-2 border-semantic-danger/30 bg-semantic-danger/5 px-3 py-2 font-sans text-sm text-semantic-danger">
              {serverError}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <PixelButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </PixelButton>
            <PixelButton
              type="submit"
              isLoading={isPending}
              className="!border-semantic-danger !bg-semantic-danger"
            >
              Kirim Laporan
            </PixelButton>
          </div>
        </form>
      </PixelCard>
    </div>
  );
}

interface ParticipantReportSectionProps {
  eventId: string;
  reportedParticipantId: string;
  reportedParticipantName: string;
}

export function ParticipantReportSection({
  eventId,
  reportedParticipantId,
  reportedParticipantName,
}: ParticipantReportSectionProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <PixelButton
        type="button"
        variant="secondary"
        className="!border-semantic-danger !text-semantic-danger"
        onClick={() => setShowDialog(true)}
      >
        Laporkan
      </PixelButton>

      {showDialog && (
        <ReportCheatingDialog
          eventId={eventId}
          reportedParticipantId={reportedParticipantId}
          reportedParticipantName={reportedParticipantName}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
