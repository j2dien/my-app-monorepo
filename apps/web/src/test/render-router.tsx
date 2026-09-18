import { QueryClientProvider } from "@tanstack/react-query";

import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

import { render } from "@testing-library/react";

import { routeTree } from "@/routeTree.gen";

import { createTestQueryClient } from "./create-test-query-client";

interface RenderRouterOptions {
  initialEntry?: string;
}

export function renderRouter({ initialEntry = "/" }: RenderRouterOptions = {}) {
  const queryClient = createTestQueryClient();

  const history = createMemoryHistory({
    initialEntries: [initialEntry],
  });

  const router = createRouter({
    routeTree,
    history,

    context: {
      queryClient,
    },
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return {
    ...result,
    router,
    queryClient,
  };
}
