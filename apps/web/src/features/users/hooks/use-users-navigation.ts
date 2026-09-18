import { useCallback } from "react";

import { useNavigate } from "@tanstack/react-router";

import type {
  PageSize,
  SortOrder,
  UserSortBy,
} from "@/features/users/api/user.types";

export function useUsersNavigation() {
  const navigate = useNavigate({
    from: "/users",
  });

  const handleSearchChange = useCallback(
    (searchValue: string | undefined) => {
      void navigate({
        replace: true,

        search: (previous) => ({
          ...previous,
          page: 1,
          search: searchValue,
        }),
      });
    },
    [navigate],
  );

  function handleClearSearch() {
    handleSearchChange(undefined);
  }

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

  function handlePageSizeChange(pageSize: PageSize) {
    void navigate({
      search: (previous) => ({
        ...previous,
        page: 1,
        pageSize,
      }),
    });
  }

  function handlePreviousPage(currentPage: number) {
    if (currentPage <= 1) {
      return;
    }

    void navigate({
      search: (previous) => ({
        ...previous,
        page: currentPage - 1,
      }),
    });
  }

  function handleNextPage(currentPage: number, totalPages: number) {
    if (currentPage >= totalPages) {
      return;
    }

    void navigate({
      search: (previous) => ({
        ...previous,
        page: currentPage + 1,
      }),
    });
  }

  return {
    handleSearchChange,
    handleClearSearch,
    handleSortByChange,
    handleSortOrderChange,
    handlePageSizeChange,
    handlePreviousPage,
    handleNextPage,
  };
}
