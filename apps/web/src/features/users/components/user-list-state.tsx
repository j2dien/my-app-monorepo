interface UserListStateProps {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  hasSearch: boolean;
  searchValue?: string;

  onRetry: () => void;
  onClearSearch: () => void;
}

export function UserListState({
  isPending,
  isError,
  isEmpty,
  hasSearch,
  searchValue,
  onRetry,
  onClearSearch,
}: UserListStateProps) {
  if (isPending) {
    return (
      <div className="mt-6 rounded-lg border border-zinc-200 p-6">
        <p className="text-sm text-zinc-500">Loading users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="font-medium text-red-900">Failed to load users</h2>

        <p className="mt-1 text-sm text-red-700">
          Something went wrong while loading the user list.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!isEmpty) {
    return null;
  }

  return (
    <div className="mt-6 rounded-lg border border-dashed border-zinc-300 p-8 text-center">
      {hasSearch ? (
        <>
          <h2 className="font-medium text-zinc-900">No users found</h2>

          <p className="mt-2 text-sm text-zinc-500">
            No users match "{searchValue}".
          </p>

          <button
            type="button"
            onClick={onClearSearch}
            className="mt-4 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-50"
          >
            Clear search
          </button>
        </>
      ) : (
        <>
          <h2 className="font-medium text-zinc-900">No users yet</h2>

          <p className="mt-2 text-sm text-zinc-500">
            Create your first user using the form.
          </p>
        </>
      )}
    </div>
  );
}
