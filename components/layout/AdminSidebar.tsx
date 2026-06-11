import Link from "next/link";
import { LayoutDashboard, Users, Calendar, LogOut } from "lucide-react";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { adminSignOut } from "@/actions/admin";

interface AdminSidebarProps {
  adminName?: string | null;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/peserta", label: "Peserta", icon: Users },
  { href: "/admin/event", label: "Event", icon: Calendar },
];

export function AdminSidebar({ adminName }: AdminSidebarProps) {
  return (
    <aside className="flex w-full flex-col border-b-2 border-tosca-muted bg-bg-card md:min-h-screen md:w-56 md:border-b-0 md:border-r-2">
      <div className="border-b-2 border-tosca-muted px-4 py-4">
        <SiteLogo height={20} />
        <p className="mt-2 font-pixel text-[8px] text-tosca-dark">Admin Panel</p>
        {adminName && (
          <p className="mt-1 font-sans text-xs text-text-muted">{adminName}</p>
        )}
      </div>

      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="pixel-focus flex items-center gap-2 whitespace-nowrap rounded-pixel px-3 py-2 font-sans text-sm text-text-primary transition hover:bg-bg-toscaTint"
          >
            <Icon size={16} className="text-tosca" />
            {label}
          </Link>
        ))}
      </nav>

      <form action={adminSignOut} className="border-t-2 border-tosca-muted p-2">
        <button
          type="submit"
          className="pixel-focus flex w-full items-center gap-2 rounded-pixel px-3 py-2 font-sans text-sm text-semantic-danger transition hover:bg-semantic-danger/5"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </form>
    </aside>
  );
}
