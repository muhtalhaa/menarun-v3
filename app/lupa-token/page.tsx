import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TokenRecoveryForm } from "@/components/forms/TokenRecoveryForm";

export default function LupaTokenPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <SiteHeader />

      <div className="mx-auto max-w-lg px-4 py-8">
        <TokenRecoveryForm />

        <p className="mt-6 text-center font-pixelBody text-lg">
          <Link href="/registrasi" className="text-tosca underline-offset-2 hover:underline">
            Belum punya akun? Daftar di sini
          </Link>
        </p>

        <SiteFooter />
      </div>
    </main>
  );
}
