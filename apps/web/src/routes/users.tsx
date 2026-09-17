import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { createUserMutationOptions } from "@/features/users/api/user.mutations";
import { usersQueryOptions } from "@/features/users/api/user.queries";
import { UserForm } from "@/features/users/components/user-form";
import { ApiError } from "@/lib/api/error";
import { userKeys } from "@/features/users/api/user.keys";
import { UserSearchInput } from "@/features/users/components/user-search-input";

const usersSearchSchema = z.object({
  page: z.number().int().positive().default(1).catch(1),

  pageSize: z.number().int().min(1).max(100).default(20).catch(20),

  search: z.string().max(100).optional(),

  sortBy: z
    .enum(["name", "email", "createdAt"])
    .default("createdAt")
    .catch("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc").catch("desc"),
});

type PageSize = 10 | 20 | 50 | 100;

export const Route = createFileRoute("/users")({
  validateSearch: usersSearchSchema,

  loaderDeps: ({ search }) => ({
    page: search.page,
    pageSize: search.pageSize,
    search: search.search,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
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
      sortBy: search.sortBy,
      sortOrder: search.sortOrder,
    }),
  );

  const isUpdating = usersQuery.isFetching && !usersQuery.isPending;

  const data = usersQuery.data;

  const users = data?.data ?? [];

  const pagination = data?.pagination;

  const hasSearch = Boolean(search.search?.trim());

  useEffect(() => {
    if (!pagination) {
      return;
    }

    if (pagination.page >= pagination.totalPages) {
      return;
    }

    void queryClient
      .query(
        usersQueryOptions({
          page: pagination.page + 1,
          pageSize: search.pageSize,
          search: search.search,
          sortBy: search.sortBy,
          sortOrder: search.sortOrder,
        }),
      )
      .catch(() => {
        // Prefetch gagal tidak perlu
        // mengganggu halaman sekarang.
      });
  }, [
    pagination,
    queryClient,
    search.pageSize,
    search.search,
    search.sortBy,
    search.sortOrder,
  ]);

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
        queryKey: userKeys.lists(),
      });
    },
  });

  const createError =
    createMutation.error instanceof ApiError ? createMutation.error : null;

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
          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
              Users
            </h1>

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

          {/* Search */}
          <div className="mt-6">
            <UserSearchInput
              key={search.search ?? ""}
              initialValue={search.search ?? ""}
              currentSearch={search.search}
              onSearchChange={(nextSearch) => {
                void navigate({
                  replace: true,

                  search: (previous) => ({
                    ...previous,
                    page: 1,
                    search: nextSearch,
                  }),
                });
              }}
            />
          </div>

          {/* Sorting */}
          <div className="mt-4 flex flex-wrap gap-3">
            <select
              value={search.sortBy}
              onChange={(event) => {
                const sortBy = event.target.value as
                  | "name"
                  | "email"
                  | "createdAt";

                void navigate({
                  search: (previous) => ({
                    ...previous,

                    // sorting baru kembali ke page 1
                    page: 1,

                    sortBy,
                  }),
                });
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="createdAt">Created</option>

              <option value="name">Name</option>

              <option value="email">Email</option>
            </select>

            <select
              value={search.sortOrder}
              onChange={(event) => {
                const sortOrder = event.target.value as "asc" | "desc";

                void navigate({
                  search: (previous) => ({
                    ...previous,
                    page: 1,
                    sortOrder,
                  }),
                });
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="desc">Descending</option>

              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* Loading */}
          {usersQuery.isPending && (
            <div className="mt-8 rounded-lg border border-zinc-200 p-6 text-sm">
              <p className="text-sm text-zinc-500">Loading users...</p>
            </div>
          )}

          {/* Query error */}
          {usersQuery.isError && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
              <h2 className="font-medium text-red-900">Failed to load users</h2>

              <p className="mt-1 text-sm text-red-700">
                Something went wrong while loading the user list.
              </p>

              <button
                type="button"
                onClick={() => {
                  void usersQuery.refetch();
                }}
                className="mt-4 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!usersQuery.isPending &&
            !usersQuery.isError &&
            users.length === 0 && (
              <div className="mt-6 rounded-lg border border-dashed border-zinc-300 p-8 text-center">
                {hasSearch ? (
                  <>
                    <h2 className="font-medium text-zinc-900">
                      No users found
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                      No users match "{search.search}".
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        void navigate({
                          replace: true,
                          search: (previous) => ({
                            ...previous,
                            page: 1,
                            search: undefined,
                          }),
                        });
                      }}
                      className="mt-4 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
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
            )}

          {/* User list */}
          {!usersQuery.isError && users.length > 0 && (
            <div
              className={[
                "mt-6 space-y-3 transition-opacity",
                usersQuery.isPlaceholderData ? "opacity-60" : "opacity-100",
              ].join(" ")}
            >
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
          )}

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <div className="mt-8 flex flex-col gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-500">
                  {pagination.total} users
                </span>

                <label className="flex items-center gap-2 text-sm text-zinc-500">
                  Per page
                  <select
                    value={search.pageSize}
                    onChange={(event) => {
                      const pageSize = Number(event.target.value) as PageSize;

                      void navigate({
                        search: (previous) => ({
                          ...previous,

                          // page size baru bisa membuat
                          // page lama tidak valid.
                          page: 1,

                          pageSize,
                        }),
                      });
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
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      pagination.page <= 1 || usersQuery.isPlaceholderData
                    }
                    onClick={handlePreviousPage}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      !pagination ||
                      pagination.page >= pagination.totalPages ||
                      usersQuery.isPlaceholderData
                    }
                    onClick={handleNextPage}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
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
