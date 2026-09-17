import type { SortOrder, UserSortBy } from "@/features/users/api/user.types";

interface UserSortControlsProps {
  sortBy: UserSortBy;
  sortOrder: SortOrder;

  onSortByChange: (sortBy: UserSortBy) => void;

  onSortOrderChange: (sortOrder: SortOrder) => void;
}

export function UserSortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: UserSortControlsProps) {
  return (
    <div className="flex gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">Sort by</span>

        <select
          value={sortBy}
          onChange={(event) => {
            onSortByChange(event.target.value as UserSortBy);
          }}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        >
          <option value="createdAt">Created</option>

          <option value="name">Name</option>

          <option value="email">Email</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">Order</span>

        <select
          value={sortOrder}
          onChange={(event) => {
            onSortOrderChange(event.target.value as SortOrder);
          }}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        >
          <option value="desc">Descending</option>

          <option value="asc">Ascending</option>
        </select>
      </label>
    </div>
  );
}
