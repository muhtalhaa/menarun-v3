import Link from "next/link";
import { SiteLogo } from "@/components/layout/SiteLogo";

export function SiteHeader() {
  return (
    <header className="flex h-14 items-center justify-between bg-tosca px-4 md:h-16 md:px-6">
      <SiteLogo height={44} />
      <nav className="flex items-center gap-2 md:gap-3">
        <Link
          href="/registrasi"
          className="pixel-focus rounded-pixel border-2 border-text-onTosca/60 bg-bg-card px-2 py-1 font-pixel text-[8px] text-tosca shadow-pixel-sm transition hover:bg-bg-tertiary md:px-3 md:py-1.5 md:text-[10px]"
        >
          Registrasi
        </Link>
        <Link
          href="/input"
          className="pixel-focus rounded-pixel border-2 border-text-onTosca/60 bg-bg-card px-2 py-1 font-pixel text-[8px] text-tosca shadow-pixel-sm transition hover:bg-bg-tertiary md:px-3 md:py-1.5 md:text-[10px]"
        >
          Input
        </Link>
      </nav>
    </header>
  );
}
