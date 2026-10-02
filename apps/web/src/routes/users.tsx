import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateUserMutation } from "@/features/users/api/user.mutations";
import { usersQueryOptions } from "@/features/users/api/user.queries";
import type { UsersQueryParams } from "@/features/users/api/user.types";
import { userSearchSchema } from "@/features/users/api/user-search.schema";
import { UserCreatePanel } from "@/features/users/components/user-create-panel";
import { UserList } from "@/features/users/components/user-list";
import { UserListHeader } from "@/features/users/components/user-list-header";
import { UserListState } from "@/features/users/components/user-list-state";
import { UserPagination } from "@/features/users/components/user-pagination";
import { UserSearchInput } from "@/features/users/components/user-search-input";
import { UserSortControls } from "@/features/users/components/user-sort-controls";
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

  loader: ({ context, deps }) => context.queryClient.query(usersQueryOptions(deps)),

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

  const {data: usersResponse, isPending, isError, isRefetching, refetch, isPlaceholderData} = useQuery(usersQueryOptions(queryParams));

  const users = usersResponse?.data ?? [];

  const pagination = usersResponse?.pagination;

  usePrefetchNextUsersPage({
    params: queryParams,
    page: pagination?.page,
    totalPages: pagination?.totalPages,
  });

  const hasSearch = Boolean(search.search?.trim());

  const isEmpty = !isPending && !isError && users.length === 0;

  const createMutation = useCreateUserMutation();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Users list */}
        <section>
          {/* Header */}
          <UserListHeader isUpdating={isRefetching} />

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
            isPending={isPending}
            isError={isError}
            isEmpty={isEmpty}
            hasSearch={hasSearch}
            searchValue={search.search}
            onRetry={() => {
              void refetch();
            }}
            onClearSearch={handleClearSearch}
          />

          {/* User list */}
          {!isError && users.length > 0 && (
            <UserList users={users} isPlaceholderData={isPlaceholderData} />
          )}

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <UserPagination
              page={pagination.page}
              pageSize={search.pageSize}
              total={pagination.total}
              totalPages={pagination.totalPages}
              isPlaceholderData={isPlaceholderData}
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

            setCreateFormKey(
              (current) => current + 1
            )
          }}
        />
      </div>
    </main>
  );
}
