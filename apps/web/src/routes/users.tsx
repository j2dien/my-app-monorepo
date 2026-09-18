import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { createUserMutationOptions } from "@/features/users/api/user.mutations";
import { usersQueryOptions } from "@/features/users/api/user.queries";
import { userKeys } from "@/features/users/api/user.keys";
import { UserSearchInput } from "@/features/users/components/user-search-input";
import { UserList } from "@/features/users/components/user-list";
import { UserPagination } from "@/features/users/components/user-pagination";
import type { UsersQueryParams } from "@/features/users/api/user.types";
import { UserSortControls } from "@/features/users/components/user-sort-controls";
import { UserListState } from "@/features/users/components/user-list-state";
import { UserCreatePanel } from "@/features/users/components/user-create-panel";
import { UserListHeader } from "@/features/users/components/user-list-header";
import { userSearchSchema } from "@/features/users/api/user-search.schema";
import { usePrefetchNextUsersPage } from "@/features/users/hooks/use-prefetch-next-users-page";
import { useUsersNavigation } from "@/features/users/hooks/use-users-navigation";

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

  const {
    handleSearchChange,
    handleClearSearch,
    handleSortByChange,
    handleSortOrderChange,
    handlePageSizeChange,
    handlePreviousPage,
    handleNextPage,
  } = useUsersNavigation();

  const queryClient = useQueryClient();

  const queryParams: UsersQueryParams = {
    page: search.page,
    pageSize: search.pageSize,
    search: search.search,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
  };

  /*
   * Digunakan untuk reset UserForm
   * setelah create berhasil.
   *
   * Karena UserForm memiliki internal
   * state TanStack Form, mengubah key
   * akan membuat instance baru.
   */
  const [createFormKey, setCreateFormKey] = useState(0);

  const usersQuery = useQuery(usersQueryOptions(queryParams));

  const data = usersQuery.data;

  const users = data?.data ?? [];

  const pagination = data?.pagination;

  usePrefetchNextUsersPage({
    params: queryParams,
    page: pagination?.page,
    totalPages: pagination?.totalPages,
  });

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
              onSearchChange={handleSearchChange}
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
              onPreviousPage={() => {
                handlePreviousPage(pagination.page);
              }}
              onNextPage={() => {
                handleNextPage(pagination.page, pagination.totalPages);
              }}
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
