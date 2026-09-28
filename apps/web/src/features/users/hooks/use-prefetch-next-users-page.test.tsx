import { describe, expect, spyOn, test } from "bun:test";

import { QueryClientProvider } from "@tanstack/react-query";

import { renderHook, waitFor } from "@testing-library/react";

import type { PropsWithChildren } from "react";
import type { UsersQueryParams } from "@/features/users/api/user.types";
import { createTestQueryClient } from "@/test/create-test-query-client";
import { usePrefetchNextUsersPage } from "./use-prefetch-next-users-page";

const params: UsersQueryParams = {
  page: 1,
  pageSize: 20,
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

function createWrapper(queryClient: ReturnType<typeof createTestQueryClient>) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("usePrefetchNextUsersPage", () => {
  test("prefetches the next page", async () => {
    const queryClient = createTestQueryClient();

    const query = spyOn(queryClient, "query").mockResolvedValue(undefined);

    renderHook(
      () =>
        usePrefetchNextUsersPage({
          params,
          page: 1,
          totalPages: 3,
        }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(query).toHaveBeenCalledTimes(1);
    });
  });

  test("does not prefetch when page is undefined", () => {
    const queryClient = createTestQueryClient();

    const query = spyOn(queryClient, "query");

    renderHook(
      () =>
        usePrefetchNextUsersPage({
          params,
          page: undefined,
          totalPages: 3,
        }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    expect(query).not.toHaveBeenCalled();
  });

  test("does not prefetch when totalPages is undefined", () => {
    const queryClient = createTestQueryClient();

    const query = spyOn(queryClient, "query");

    renderHook(
      () =>
        usePrefetchNextUsersPage({
          params,
          page: 1,
          totalPages: undefined,
        }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    expect(query).not.toHaveBeenCalled();
  });

  test("does not prefetch on the last page", () => {
    const queryClient = createTestQueryClient();

    const query = spyOn(queryClient, "query");

    renderHook(
      () =>
        usePrefetchNextUsersPage({
          params,
          page: 3,
          totalPages: 3,
        }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    expect(query).not.toHaveBeenCalled();
  });

  test("ignores prefetch errors", async () => {
    const queryClient = createTestQueryClient();

    const query = spyOn(queryClient, "query").mockRejectedValue(new Error("Prefetch failed"));

    renderHook(
      () =>
        usePrefetchNextUsersPage({
          params,
          page: 1,
          totalPages: 3,
        }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(query).toHaveBeenCalledTimes(1);
    });

    // Memberi microtask .catch() kesempatan
    // untuk dieksekusi.
    await Promise.resolve();
  });
});
