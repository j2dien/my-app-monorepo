import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { throwApiError } from "@/lib/api/error";

export interface UsersQueryParams {
  page: number;
  pageSize: number;
  search?: string;
}

export function usersQueryOptions(params: UsersQueryParams) {
  return queryOptions({
    queryKey: ["users", "list", params],

    staleTime: 30_000,

    placeholderData: keepPreviousData,

    queryFn: async () => {
      const response = await api.api.v1.users.$get({
        query: {
          page: String(params.page),

          pageSize: String(params.pageSize),

          ...(params.search
            ? {
                search: params.search,
              }
            : {}),
        },
      });

      if (!response.ok) {
        return throwApiError(response);
      }

      return response.json();
    },
  });
}

export function userQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["users", userId],
    staleTime: 30_000,

    queryFn: async () => {
      const response = await api.api.v1.users[":id"].$get({
        param: {
          id: userId,
        },
      });

      if (!response.ok) {
        return throwApiError(response);
      }

      const body = await response.json();

      return body.data;
    },
  });
}
