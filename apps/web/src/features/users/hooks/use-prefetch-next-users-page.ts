import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { usersQueryOptions } from "@/features/users/api/user.queries";

import type { UsersQueryParams } from "@/features/users/api/user.types";

interface UsePrefetchNextUsersPageOptions {
  params: UsersQueryParams;
  page?: number;
  totalPages?: number;
}

export function usePrefetchNextUsersPage({
  params,
  page,
  totalPages,
}: UsePrefetchNextUsersPageOptions) {
  const queryClient = useQueryClient();

  const { pageSize, search, sortBy, sortOrder } = params;

  useEffect(() => {
    if (page === undefined || totalPages === undefined) {
      return;
    }

    if (page >= totalPages) {
      return;
    }

    const nextParams: UsersQueryParams = {
      page: page + 1,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    void queryClient.query(usersQueryOptions(nextParams)).catch(() => {
      /*
       * Prefetch bersifat optimisasi.
       * Kalau gagal, jangan tampilkan
       * error ke user.
       *
       * Request normal saat user klik
       * Next tetap akan mencoba lagi.
       */
    });
  }, [page, totalPages, pageSize, search, sortBy, sortOrder, queryClient]);
}
