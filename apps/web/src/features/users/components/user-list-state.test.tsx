import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserListState } from "./user-list-state";

test("renders loading state", () => {
  const { getByText, queryByText } = render(
    <UserListState
      isPending
      isError={false}
      isEmpty={false}
      hasSearch={false}
      onRetry={() => {}}
      onClearSearch={() => {}}
    />,
  );

  expect(getByText("Loading users...")).toBeInTheDocument();

  expect(queryByText("Failed to load users")).not.toBeInTheDocument();
});

test("renders error state", () => {
  const { getByText } = render(
    <UserListState
      isPending={false}
      isError
      isEmpty={false}
      hasSearch={false}
      onRetry={() => {}}
      onClearSearch={() => {}}
    />,
  );

  expect(getByText("Failed to load users")).toBeInTheDocument();

  expect(
    getByText("Something went wrong while loading the user list."),
  ).toBeInTheDocument();
});

test("calls retry callback", async () => {
  const user = userEvent.setup();

  let called = false;

  const { getByRole } = render(
    <UserListState
      isPending={false}
      isError
      isEmpty={false}
      hasSearch={false}
      onRetry={() => {
        called = true;
      }}
      onClearSearch={() => {}}
    />,
  );

  await user.click(
    getByRole("button", {
      name: "Try again",
    }),
  );

  expect(called).toBe(true);
});

test("renders empty state when there are no users", () => {
  const { getByText, queryByRole } = render(
    <UserListState
      isPending={false}
      isError={false}
      isEmpty
      hasSearch={false}
      onRetry={() => {}}
      onClearSearch={() => {}}
    />,
  );

  expect(getByText("No users yet")).toBeInTheDocument();

  expect(
    getByText("Create your first user using the form."),
  ).toBeInTheDocument();

  expect(
    queryByRole("button", {
      name: "Clear search",
    }),
  ).not.toBeInTheDocument();
});

test("renders no search results state", () => {
  const { getByText, getByRole } = render(
    <UserListState
      isPending={false}
      isError={false}
      isEmpty
      hasSearch
      searchValue="john"
      onRetry={() => {}}
      onClearSearch={() => {}}
    />,
  );

  expect(getByText("No users found")).toBeInTheDocument();

  expect(getByText('No users match "john".')).toBeInTheDocument();

  expect(
    getByRole("button", {
      name: "Clear search",
    }),
  ).toBeInTheDocument();
});

test("calls clear search callback", async () => {
  const user = userEvent.setup();

  let called = false;

  const { getByRole } = render(
    <UserListState
      isPending={false}
      isError={false}
      isEmpty
      hasSearch
      searchValue="john"
      onRetry={() => {}}
      onClearSearch={() => {
        called = true;
      }}
    />,
  );

  await user.click(
    getByRole("button", {
      name: "Clear search",
    }),
  );

  expect(called).toBe(true);
});

test("renders nothing when list has data", () => {
  const { container } = render(
    <UserListState
      isPending={false}
      isError={false}
      isEmpty={false}
      hasSearch={false}
      onRetry={() => {}}
      onClearSearch={() => {}}
    />,
  );

  expect(container.firstChild).toBeNull();
});
