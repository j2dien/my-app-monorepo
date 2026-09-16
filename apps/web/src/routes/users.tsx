import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { createUserMutationOptions } from "@/features/users/api/user.mutations";
import { usersQueryOptions } from "@/features/users/api/user.queries";
import { UserForm } from "@/features/users/components/user-form";
import { ApiError } from "@/lib/api/error";

const usersSearchSchema = z.object({
  page: z.number().int().positive().default(1).catch(1),

  pageSize: z.number().int().min(1).max(100).default(20).catch(20),

  search: z.string().max(100).optional(),
});

export const Route = createFileRoute("/users")({
  validateSearch: usersSearchSchema,

  loaderDeps: ({ search }) => ({
    page: search.page,
    pageSize: search.pageSize,
    search: search.search,
  }),

  loader: ({ context, deps }) =>
    context.queryClient.query(usersQueryOptions(deps)),

  component: UsersPage,
});

function UsersPage() {
  const search = Route.useSearch();

  const navigate = Route.useNavigate();

  const queryClient = useQueryClient();

  /*
   * Local state untuk search input.
   *
   * URL tetap menjadi source of truth,
   * tapi kita tidak mengubah URL pada
   * setiap keyboard input.
   */
  const [searchValue, setSearchValue] = useState(search.search ?? "");

  /*
   * Digunakan untuk reset UserForm
   * setelah create berhasil.
   *
   * Karena UserForm memiliki internal
   * state TanStack Form, mengubah key
   * akan membuat instance baru.
   */
  const [createFormKey, setCreateFormKey] = useState(0);

  const usersQuery = useQuery(
    usersQueryOptions({
      page: search.page,
      pageSize: search.pageSize,
      search: search.search,
    }),
  );

  const createMutation = useMutation({
    ...createUserMutationOptions,

    onSuccess: async () => {
      /*
       * Reset form create.
       */
      setCreateFormKey((current) => current + 1);

      /*
       * Semua variasi users list:
       *
       * ['users', 'list', {...}]
       *
       * akan dianggap stale.
       */
      await queryClient.invalidateQueries({
        queryKey: ["users", "list"],
      });
    },
  });

  const createError =
    createMutation.error instanceof ApiError ? createMutation.error : null;

  const data = usersQuery.data;

  const users = data?.data ?? [];

  const pagination = data?.pagination;

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSearch = searchValue.trim();

    void navigate({
      search: (previous) => ({
        ...previous,

        /*
         * Search baru selalu kembali
         * ke page pertama.
         */
        page: 1,

        search: normalizedSearch || undefined,
      }),
    });
  }

  function handlePreviousPage() {
    if (!pagination || pagination.page <= 1) {
      return;
    }

    void navigate({
      search: (previous) => ({
        ...previous,
        page: previous.page - 1,
      }),
    });
  }

  function handleNextPage() {
    if (!pagination || pagination.page >= pagination.totalPages) {
      return;
    }

    void navigate({
      search: (previous) => ({
        ...previous,
        page: previous.page + 1,
      }),
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Users list */}
        <section>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Users
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Manage users registered in the application.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
            <input
              type="search"
              value={searchValue}
              placeholder="Search name or email..."
              onChange={(event) => setSearchValue(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />

            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Search
            </button>

            {search.search && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");

                  void navigate({
                    search: (previous) => ({
                      ...previous,
                      page: 1,
                      search: undefined,
                    }),
                  });
                }}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Clear
              </button>
            )}
          </form>

          {/* Loading */}
          {usersQuery.isPending && (
            <div className="mt-8 rounded-lg border border-zinc-200 p-6 text-sm text-zinc-500">
              Loading users...
            </div>
          )}

          {/* Query error */}
          {usersQuery.isError && (
            <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load users.
            </div>
          )}

          {/* Empty state */}
          {!usersQuery.isPending &&
            !usersQuery.isError &&
            users.length === 0 && (
              <div className="mt-8 rounded-lg border border-dashed border-zinc-300 p-10 text-center">
                <p className="font-medium text-zinc-900">No users found</p>

                <p className="mt-1 text-sm text-zinc-500">
                  {search.search
                    ? "Try another search."
                    : "Create your first user."}
                </p>
              </div>
            )}

          {/* User list */}
          {users.length > 0 && (
            <div className="mt-8 space-y-3">
              {users.map((user) => (
                <Link
                  key={user.id}
                  to="/users/$userId"
                  params={{
                    userId: user.id,
                  }}
                  className="block rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-zinc-950">
                        {user.name}
                      </div>

                      <div className="mt-1 truncate text-sm text-zinc-500">
                        {user.email}
                      </div>
                    </div>

                    <span className="shrink-0 text-sm text-zinc-400">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <div className="mt-8 flex flex-col gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-zinc-500">
                Page {pagination.page} of {pagination.totalPages}
                {" · "}
                {pagination.total} users
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={handlePreviousPage}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={handleNextPage}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Create user */}
        <aside>
          <div className="sticky top-6 rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-950">Create user</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Add a new user to the application.
            </p>

            <div className="mt-6">
              <UserForm
                key={createFormKey}
                submitLabel="Create user"
                onSubmit={async (input) => {
                  await createMutation.mutateAsync(input);
                }}
              />
            </div>

            {/* Server/general error */}
            {createError && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{createError.message}</p>

                {createError.requestId && (
                  <p className="mt-1 text-xs text-red-500">
                    Request ID: {createError.requestId}
                  </p>
                )}
              </div>
            )}

            {/* Success */}
            {createMutation.isSuccess && !createMutation.isPending && (
              <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                User created successfully.
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
