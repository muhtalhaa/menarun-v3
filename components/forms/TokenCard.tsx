"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { PixelCard } from "@/components/ui/PixelCard";
import { PixelButton } from "@/components/ui/PixelButton";

interface TokenCardProps {
  token: string;
}

export function TokenCard({ token }: TokenCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <PixelCard className="p-6">
      <h2 className="font-pixel text-xs text-tosca-dark">Token Anda</h2>

      <div className="mt-4 flex items-center justify-center gap-2">
        <p className="font-mono text-2xl font-bold tracking-widest text-tosca md:text-3xl">
          {token}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="pixel-focus rounded-pixel border-2 border-tosca-muted p-2 text-tosca hover:bg-bg-toscaTint"
          aria-label="Salin token"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <p className="mt-4 font-sans text-sm leading-relaxed text-text-secondary">
        Ingat dan simpan token ini. Token diperlukan setiap kali Anda menginput
        aktivitas. Token tidak dapat dipulihkan tanpa No. AIMS dan email yang
        terdaftar.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/input">
          <PixelButton className="w-full sm:w-auto">Input Aktivitas</PixelButton>
        </Link>
        <Link href="/">
          <PixelButton variant="secondary" className="w-full sm:w-auto">
            Kembali ke Beranda
          </PixelButton>
        </Link>
      </div>
    </PixelCard>
  );
}
