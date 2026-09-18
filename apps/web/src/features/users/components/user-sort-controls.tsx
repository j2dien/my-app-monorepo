import {
  SORT_ORDERS,
  SORT_ORDER_LABELS,
  USER_SORT_LABELS,
  USER_SORT_VALUES,
} from "@/features/users/api/user.constants";

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
          {USER_SORT_VALUES.map((value) => (
            <option key={value} value={value}>
              {USER_SORT_LABELS[value]}
            </option>
          ))}
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
          {SORT_ORDERS.map((value) => (
            <option key={value} value={value}>
              {SORT_ORDER_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
