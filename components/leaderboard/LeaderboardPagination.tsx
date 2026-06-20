"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PixelButton } from "@/components/ui/PixelButton";

interface LeaderboardPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function LeaderboardPagination({
  currentPage,
  totalPages,
}: LeaderboardPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Pagination leaderboard"
      className="flex flex-col items-center gap-3"
    >
      <p className="font-sans text-sm text-text-muted">
        Halaman {currentPage} dari {totalPages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {currentPage > 1 ? (
          <Link href={pageHref(currentPage - 1)}>
            <PixelButton variant="secondary" className="text-[10px]">
              ← Sebelumnya
            </PixelButton>
          </Link>
        ) : (
          <PixelButton variant="secondary" className="text-[10px]" disabled>
            ← Sebelumnya
          </PixelButton>
        )}

        {pages.map((page) => (
          <Link key={page} href={pageHref(page)}>
            <PixelButton
              variant={page === currentPage ? "primary" : "secondary"}
              className="min-w-[2.5rem] text-[10px]"
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </PixelButton>
          </Link>
        ))}

        {currentPage < totalPages ? (
          <Link href={pageHref(currentPage + 1)}>
            <PixelButton variant="secondary" className="text-[10px]">
              Selanjutnya →
            </PixelButton>
          </Link>
        ) : (
          <PixelButton variant="secondary" className="text-[10px]" disabled>
            Selanjutnya →
          </PixelButton>
        )}
      </div>
    </nav>
  );
}
