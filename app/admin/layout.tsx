import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary md:flex-row">
      <AdminSidebar adminName={session?.user?.name} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
