import { useEffect, useState } from "react";

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

  useEffect(() => {
    const normalized = debouncedSearch.trim();

    const nextSearch = normalized || undefined;

    if (nextSearch === currentSearch) {
      return;
    }

    onSearchChange(nextSearch);
  }, [debouncedSearch, currentSearch, onSearchChange]);

  function handleClear() {
    setSearchValue("");

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
