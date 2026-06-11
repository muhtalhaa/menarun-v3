import Link from "next/link";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/forms/AdminLoginForm";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { PixelLoader } from "@/components/ui/PixelLoader";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="flex h-14 items-center justify-center bg-tosca md:h-16">
        <SiteLogo height={24} />
      </div>

      <div className="mx-auto max-w-md px-4 py-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <PixelLoader />
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>

        <p className="mt-6 text-center font-pixelBody text-lg">
          <Link href="/" className="text-tosca underline-offset-2 hover:underline">
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </main>
  );
}
