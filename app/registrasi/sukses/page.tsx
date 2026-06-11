import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RegistrationSuccess } from "@/app/registrasi/sukses/RegistrationSuccess";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function RegistrasiSuksesPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token || token.length > 12) {
    redirect("/registrasi");
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <SiteHeader />

      <div className="mx-auto max-w-lg px-4 py-8">
        <RegistrationSuccess token={token} />
        <SiteFooter />
      </div>
    </main>
  );
}
