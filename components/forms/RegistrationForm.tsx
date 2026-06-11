"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerParticipant } from "@/actions/register-participant";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import { MajlisSelect } from "@/components/forms/MajlisSelect";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validations/registration.schema";
import { normalizePhone } from "@/lib/format";

interface RegistrationFormProps {
  majlisOptions: string[];
}

export function RegistrationForm({ majlisOptions }: RegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nama: "",
      noAims: "",
      majlis: "",
      email: "",
      usia: undefined,
      noHp: "",
    },
  });

  function onSubmit(data: RegistrationInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await registerParticipant({
        ...data,
        noHp: normalizePhone(data.noHp),
      });

      if (result && !result.success) {
        setServerError(result.error.message);
        toast.error(result.error.message);
      }
    });
  }

  return (
    <PixelCard className="p-6">
      <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
        Registrasi Peserta
      </h1>
      <p className="mt-2 font-pixelBody text-lg text-text-muted">
        Daftar sekali, simpan token Anda untuk input aktivitas.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <PixelInput
          label="Nama Lengkap"
          placeholder="Nama sesuai KTP"
          error={errors.nama?.message}
          {...register("nama")}
        />

        <PixelInput
          label="No. AIMS"
          placeholder="12345"
          maxLength={5}
          inputMode="numeric"
          pattern="[0-9]{5}"
          error={errors.noAims?.message}
          {...register("noAims")}
        />

        <Controller
          name="majlis"
          control={control}
          render={({ field }) => (
            <MajlisSelect
              options={majlisOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.majlis?.message}
            />
          )}
        />

        <PixelInput
          label="Email"
          type="email"
          placeholder="email@contoh.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <PixelInput
          label="Usia"
          type="number"
          min={10}
          max={99}
          placeholder="25"
          error={errors.usia?.message}
          {...register("usia", { valueAsNumber: true })}
        />

        <PixelInput
          label="No. HP"
          type="tel"
          placeholder="08xxxxxxxxxx"
          error={errors.noHp?.message}
          {...register("noHp")}
        />

        {serverError && (
          <p className="rounded-pixel border-2 border-semantic-danger/30 bg-semantic-danger/5 px-3 py-2 font-sans text-sm text-semantic-danger">
            {serverError}
          </p>
        )}

        <PixelButton type="submit" isLoading={isPending} className="mt-2 w-full">
          Daftar
        </PixelButton>
      </form>
    </PixelCard>
  );
}
