import type { PageSize } from "@/features/users/api/user.types";

interface UserPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isPlaceholderData: boolean;

  onPageSizeChange: (pageSize: PageSize) => void;

  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function UserPagination({
  page,
  pageSize,
  total,
  totalPages,
  isPlaceholderData,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
}: UserPaginationProps) {
  return (
    <div className="mt-8 flex flex-col gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500">{total} users</span>

        <label className="flex items-center gap-2 text-sm text-zinc-500">
          Per page
          <select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value) as PageSize);
            }}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-700 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          >
            <option value={10}>10</option>

            <option value={20}>20</option>

            <option value={50}>50</option>

            <option value={100}>100</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500">
          Page {page} of {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || isPlaceholderData}
            onClick={onPreviousPage}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={page >= totalPages || isPlaceholderData}
            onClick={onNextPage}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
