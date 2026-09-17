interface UserListHeaderProps {
  isUpdating: boolean;
}

export function UserListHeader({ isUpdating }: UserListHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>

        <p className="mt-2 text-sm text-zinc-500">
          Manage users registered in the application.
        </p>
      </div>

      {isUpdating && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="size-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
          Updating...
        </div>
      )}
    </div>
  );
}
