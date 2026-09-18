import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { createUserMutationOptions } from "@/features/users/api/user.mutations";
import { usersQueryOptions } from "@/features/users/api/user.queries";
import { userKeys } from "@/features/users/api/user.keys";
import { UserSearchInput } from "@/features/users/components/user-search-input";
import { UserList } from "@/features/users/components/user-list";
import { UserPagination } from "@/features/users/components/user-pagination";
import type { SortOrder, UserSortBy } from "@/features/users/api/user.types";
import { UserSortControls } from "@/features/users/components/user-sort-controls";
import { UserListState } from "@/features/users/components/user-list-state";
import { UserCreatePanel } from "@/features/users/components/user-create-panel";
import { UserListHeader } from "@/features/users/components/user-list-header";
import { userSearchSchema } from "@/features/users/api/user-search.schema";

export const Route = createFileRoute("/users")({
  validateSearch: userSearchSchema,

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

  const data = usersQuery.data;

  const users = data?.data ?? [];

  const pagination = data?.pagination;

  const hasSearch = Boolean(search.search?.trim());

  const isEmpty =
    !usersQuery.isPending && !usersQuery.isError && users.length === 0;

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

  function handleSortByChange(sortBy: UserSortBy) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: 1,
        sortBy,
      }),
    });
  }

  function handleSortOrderChange(sortOrder: SortOrder) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: 1,
        sortOrder,
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

  function handlePageSizeChange(pageSize: 10 | 20 | 50 | 100) {
    void navigate({
      search: (previous) => ({
        ...previous,

        page: 1,

        pageSize,
      }),
    });
  }

  function handleClearSearch() {
    void navigate({
      replace: true,

      search: (previous) => ({
        ...previous,
        page: 1,
        search: undefined,
      }),
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Users list */}
        <section>
          {/* Header */}
          <UserListHeader isUpdating={usersQuery.isRefetching} />

          {/* Search */}
          <div className="mt-6">
            <UserSearchInput
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
          <div className="mt-4">
            <UserSortControls
              sortBy={search.sortBy}
              sortOrder={search.sortOrder}
              onSortByChange={handleSortByChange}
              onSortOrderChange={handleSortOrderChange}
            />
          </div>

          {/* Loading/Query error/Empty state */}
          <UserListState
            isPending={usersQuery.isPending}
            isError={usersQuery.isError}
            isEmpty={isEmpty}
            hasSearch={hasSearch}
            searchValue={search.search}
            onRetry={() => {
              void usersQuery.refetch();
            }}
            onClearSearch={handleClearSearch}
          />

          {/* User list */}
          {!usersQuery.isError && users.length > 0 && (
            <UserList
              users={users}
              isPlaceholderData={usersQuery.isPlaceholderData}
            />
          )}

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <UserPagination
              page={pagination.page}
              pageSize={search.pageSize}
              total={pagination.total}
              totalPages={pagination.totalPages}
              isPlaceholderData={usersQuery.isPlaceholderData}
              onPageSizeChange={handlePageSizeChange}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
            />
          )}
        </section>

        {/* Create user */}
        <UserCreatePanel
          formKey={createFormKey}
          isPending={createMutation.isPending}
          onSubmit={async (input) => {
            await createMutation.mutateAsync(input);
          }}
        />
      </div>
    </main>
  );
}
