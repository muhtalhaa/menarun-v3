"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { recoverToken } from "@/actions/recover-token";
import { TokenCard } from "@/components/forms/TokenCard";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import {
  tokenRecoverySchema,
  type TokenRecoveryInput,
} from "@/lib/validations/registration.schema";

export function TokenRecoveryForm() {
  const [isPending, startTransition] = useTransition();
  const [recoveredToken, setRecoveredToken] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TokenRecoveryInput>({
    resolver: zodResolver(tokenRecoverySchema),
    defaultValues: { noAims: "", email: "" },
  });

  function onSubmit(data: TokenRecoveryInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await recoverToken(data);

      if (!result.success) {
        setServerError(result.error.message);
        toast.error(result.error.message);
        return;
      }

      setRecoveredToken(result.data.token);
      toast.success("Token ditemukan!");
    });
  }

  if (recoveredToken) {
    return <TokenCard token={recoveredToken} />;
  }

  return (
    <PixelCard className="p-6">
      <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
        Lupa Token?
      </h1>
      <p className="mt-2 font-pixelBody text-lg text-text-muted">
        Masukkan No. AIMS dan email yang terdaftar untuk melihat token Anda.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <PixelInput
          label="No. AIMS"
          placeholder="12345"
          maxLength={5}
          inputMode="numeric"
          error={errors.noAims?.message}
          {...register("noAims")}
        />

        <PixelInput
          label="Email"
          type="email"
          placeholder="email@contoh.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {serverError && (
          <p className="rounded-pixel border-2 border-semantic-danger/30 bg-semantic-danger/5 px-3 py-2 font-sans text-sm text-semantic-danger">
            {serverError}
          </p>
        )}

        <PixelButton type="submit" isLoading={isPending} className="mt-2 w-full">
          Tampilkan Token
        </PixelButton>
      </form>
    </PixelCard>
  );
}
