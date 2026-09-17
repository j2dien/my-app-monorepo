import { Link } from "@tanstack/react-router";

interface UserListItem {
  id: string;
  name: string;
  email: string;
}

interface UserListProps {
  users: UserListItem[];
  isPlaceholderData: boolean;
}

export function UserList({ users, isPlaceholderData }: UserListProps) {
  return (
    <div
      className={[
        "mt-6 space-y-3 transition-opacity",
        isPlaceholderData ? "opacity-60" : "opacity-100",
      ].join(" ")}
    >
      {users.map((user) => (
        <Link
          key={user.id}
          to="/users/$userId"
          params={{
            userId: user.id,
          }}
          className="block rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50"
        >
          <div className="font-medium">{user.name}</div>

          <div className="text-sm text-zinc-500">{user.email}</div>
        </Link>
      ))}
    </div>
  );
}
