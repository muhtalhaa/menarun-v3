"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PixelInput } from "@/components/ui/PixelInput";
import { PixelButton } from "@/components/ui/PixelButton";
import { PixelCard } from "@/components/ui/PixelCard";
import {
  adminLoginSchema,
  type AdminLoginInput,
} from "@/lib/validations/admin.schema";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: AdminLoginInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        const message = "Email atau password salah.";
        setServerError(message);
        toast.error(message);
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      }
    });
  }

  return (
    <PixelCard className="p-6">
      <h1 className="font-pixel text-xs text-tosca-dark md:text-sm">
        Login Admin
      </h1>
      <p className="mt-2 font-pixelBody text-lg text-text-muted">
        Halaman ini hanya untuk administrator menaRun.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <PixelInput
          label="Email Admin"
          type="email"
          placeholder="admin@menarun.app"
          error={errors.email?.message}
          {...register("email")}
        />

        <PixelInput
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="rounded-pixel border-2 border-semantic-danger/30 bg-semantic-danger/5 px-3 py-2 font-sans text-sm text-semantic-danger">
            {serverError}
          </p>
        )}

        <PixelButton type="submit" isLoading={isPending} className="mt-2 w-full">
          Masuk
        </PixelButton>
      </form>
    </PixelCard>
  );
}
