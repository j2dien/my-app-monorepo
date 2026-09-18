import { useEffect, useRef, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface UserSearchInputProps {
  initialValue: string;
  currentSearch?: string;

  onSearchChange: (value: string | undefined) => void;
}

export function UserSearchInput({
  initialValue,
  currentSearch,
  onSearchChange,
}: UserSearchInputProps) {
  const [searchValue, setSearchValue] = useState(initialValue);

  const debouncedSearch = useDebouncedValue(searchValue, 400);

  /*
   * Search yang sedang kita tunggu
   * untuk dikonfirmasi oleh router.
   *
   * null = tidak ada navigation pending.
   */
  const pendingSearchRef = useRef<{
    value: string | undefined;
  } | null>(null);

  /*
   * Digunakan untuk mendeteksi apakah
   * currentSearch benar-benar berubah
   * dari router.
   */
  const previousSearchRef = useRef(currentSearch);

  /*
   * Local draft -> Router
   */
  useEffect(() => {
    /*
     * Jangan submit debounce lama.
     */
    if (debouncedSearch !== searchValue) {
      return;
    }

    const normalized = debouncedSearch.trim();

    const nextSearch = normalized || undefined;

    /*
     * Router sudah memiliki nilai
     * yang kita inginkan.
     */
    if (nextSearch === currentSearch) {
      return;
    }

    /*
     * Navigation dengan nilai yang sama
     * sudah sedang berlangsung.
     */
    if (pendingSearchRef.current?.value === nextSearch) {
      return;
    }

    pendingSearchRef.current = {
      value: nextSearch,
    };

    onSearchChange(nextSearch);
  }, [debouncedSearch, searchValue, currentSearch, onSearchChange]);

  /*
   * Router -> local draft
   *
   * Hanya jalan ketika currentSearch
   * benar-benar berubah.
   */
  useEffect(() => {
    if (currentSearch === previousSearchRef.current) {
      return;
    }

    previousSearchRef.current = currentSearch;

    /*
     * Kalau ini adalah acknowledgement
     * dari navigation yang kita submit
     * sendiri, local state tidak perlu
     * diubah.
     */
    if (
      pendingSearchRef.current &&
      pendingSearchRef.current.value === currentSearch
    ) {
      pendingSearchRef.current = null;

      return;
    }

    /*
     * Kalau nilainya berbeda dari pending
     * request, berarti URL berubah dari luar:
     *
     * - browser Back
     * - browser Forward
     * - Clear dari parent
     */
    pendingSearchRef.current = null;

    // oxlint-disable-next-line react/set-state-in-effect -- Sync local draft with external router navigation.
    setSearchValue(currentSearch ?? "");
  }, [currentSearch]);

  function handleClear() {
    setSearchValue("");

    if (currentSearch === undefined) {
      return;
    }

    pendingSearchRef.current = {
      value: undefined,
    };

    onSearchChange(undefined);
  }

  return (
    <div>
      <label htmlFor="user-search" className="sr-only">
        Search users
      </label>

      <div className="relative">
        <input
          id="user-search"
          type="search"
          value={searchValue}
          placeholder="Search name or email..."
          onChange={(event) => {
            setSearchValue(event.target.value);
          }}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-20 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />

        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
