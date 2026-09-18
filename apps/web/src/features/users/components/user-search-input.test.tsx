import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserSearchInput } from "./user-search-input";

test("renders current search value", () => {
  render(
    <UserSearchInput
      initialValue="john"
      currentSearch="john"
      onSearchChange={() => {}}
    />,
  );

  expect(screen.getByRole("searchbox")).toHaveValue("john");
});

test("allows user to type without losing focus", async () => {
  const user = userEvent.setup();

  render(
    <UserSearchInput
      initialValue=""
      currentSearch={undefined}
      onSearchChange={() => {}}
    />,
  );

  const input = screen.getByRole("searchbox");

  await user.click(input);

  await user.type(input, "john");

  expect(input).toHaveValue("john");

  expect(input).toHaveFocus();
});
