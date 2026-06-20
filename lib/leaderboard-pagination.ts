export const LEADERBOARD_PAGE_SIZE = 10;

export interface PaginatedResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function paginateLeaderboardEntries<T>(
  items: T[],
  page: number,
  pageSize = LEADERBOARD_PAGE_SIZE
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems: items.length,
  };
}

export function parseLeaderboardPage(rawPage?: string): number {
  const parsed = Number.parseInt(rawPage ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
