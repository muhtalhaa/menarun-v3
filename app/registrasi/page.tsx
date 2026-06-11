import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RegistrasiPage() {
  const majlisList = await prisma.majlis.findMany({
    where: { isActive: true },
    orderBy: { nama: "asc" },
    select: { nama: true },
  });

  const majlisOptions = majlisList.map((m) => m.nama);

  return (
    <main className="min-h-screen bg-bg-primary">
      <SiteHeader />

      <div className="mx-auto max-w-lg px-4 py-8">
        <RegistrationForm majlisOptions={majlisOptions} />

        <p className="mt-6 text-center font-pixelBody text-lg">
          <Link href="/lupa-token" className="text-tosca underline-offset-2 hover:underline">
            Lupa Token?
          </Link>
        </p>

        <SiteFooter />
      </div>
    </main>
  );
}
