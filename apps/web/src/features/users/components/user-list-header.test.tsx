import { expect, test } from "bun:test";
import { render } from "@testing-library/react";

import { UserListHeader } from "./user-list-header";

test("renders users heading and description", () => {
  const { getByRole, getByText } = render(
    <UserListHeader isUpdating={false} />,
  );

  expect(
    getByRole("heading", {
      name: "Users",
    }),
  ).toBeInTheDocument();

  expect(
    getByText("Manage users registered in the application."),
  ).toBeInTheDocument();
});

test("does not show updating indicator by default", () => {
  const { queryByText } = render(<UserListHeader isUpdating={false} />);

  expect(queryByText("Updating...")).not.toBeInTheDocument();
});

test("shows status while updating", () => {
  const { getByRole } = render(<UserListHeader isUpdating />);

  expect(getByRole("status")).toHaveTextContent("Updating...");
});
