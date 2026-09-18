import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

import { UserList } from "./user-list";

function renderUserList(props: React.ComponentProps<typeof UserList>) {
  const rootRoute = createRootRoute();

  const usersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/users",
    component: () => <UserList {...props} />,
  });

  const userDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/users/$userId",
    component: () => null,
  });

  const routeTree = rootRoute.addChildren([usersRoute, userDetailRoute]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: ["/users"],
    }),
  });

  return render(<RouterProvider router={router} />);
}

test("renders users", async () => {
  const { findByText } = renderUserList({
    users: [
      {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
      },
      {
        id: "user-2",
        name: "Jane Doe",
        email: "jane@example.com",
      },
    ],
    isPlaceholderData: false,
  });

  expect(await findByText("John Doe")).toBeInTheDocument();

  expect(await findByText("john@example.com")).toBeInTheDocument();

  expect(await findByText("Jane Doe")).toBeInTheDocument();
});

test("reduces opacity while placeholder data is shown", async () => {
  const { container, findByText } = renderUserList({
    users: [
      {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
      },
    ],
    isPlaceholderData: true,
  });

  await findByText("John Doe");

  const list = container.querySelector(".opacity-60");

  expect(list).toBeInTheDocument();
});