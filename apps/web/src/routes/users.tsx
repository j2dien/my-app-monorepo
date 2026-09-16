import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { createUserMutationOptions } from "@/features/users/api/user.mutations";
import { usersQueryOptions } from "@/features/users/api/user.queries";
import { ApiError } from "@/lib/api/error";

export const Route = createFileRoute("/users")({
  loader: ({ context }) =>
    context.queryClient.query({
      ...usersQueryOptions,
    }),
  component: UsersPage,
});

function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users } = useSuspenseQuery(usersQueryOptions);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const mutation = useMutation({
    ...createUserMutationOptions,

    onSuccess: async () => {
      setName("");
      setEmail("");

      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });

  const error = mutation.error instanceof ApiError ? mutation.error : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>

          <div className="mt-6 space-y-3">
            {users.map((user) => (
              <Link
                key={user.id}
                to="/users/$userId"
                params={{
                  userId: user.id,
                }}
                className="block rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50"
              >
                <div className="font-medium">{user.name}</div>

                <div className="text-sm text-zinc-500">{user.email}</div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Create user</h2>

          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();

              mutation.mutate({
                name,
                email,
              });
            }}
          >
            <div>
              <label className="text-sm font-medium">Name</label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />

              {error?.fields?.name && (
                <p className="mt-1 text-sm text-red-600">{error.fields.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
              />

              {error?.fields?.email && (
                <p className="mt-1 text-sm text-red-600">
                  {error.fields.email}
                </p>
              )}
            </div>

            {error && !error.fields && (
              <p className="text-sm text-red-600">{error.message}</p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : "Create user"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
