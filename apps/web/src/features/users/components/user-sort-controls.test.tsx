import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserSortControls } from "./user-sort-controls";

test("renders current sorting values", () => {
  const { getAllByRole } = render(
    <UserSortControls
      sortBy="createdAt"
      sortOrder="desc"
      onSortByChange={() => {}}
      onSortOrderChange={() => {}}
    />,
  );

  const selects = getAllByRole("combobox");

  expect(selects[0]).toHaveValue("createdAt");

  expect(selects[1]).toHaveValue("desc");
});

test("calls sort by callback", async () => {
  const user = userEvent.setup();

  let selectedSortBy: string | undefined;

  const { getAllByRole } = render(
    <UserSortControls
      sortBy="createdAt"
      sortOrder="desc"
      onSortByChange={(value) => {
        selectedSortBy = value;
      }}
      onSortOrderChange={() => {}}
    />,
  );

  const [sortBySelect] = getAllByRole("combobox");

  await user.selectOptions(sortBySelect, "name");

  expect(selectedSortBy).toBe("name");
});

test("calls sort order callback", async () => {
  const user = userEvent.setup();

  let selectedSortOrder: string | undefined;

  const { getAllByRole } = render(
    <UserSortControls
      sortBy="createdAt"
      sortOrder="desc"
      onSortByChange={() => {}}
      onSortOrderChange={(value) => {
        selectedSortOrder = value;
      }}
    />,
  );

  const [, sortOrderSelect] = getAllByRole("combobox");

  await user.selectOptions(sortOrderSelect, "asc");

  expect(selectedSortOrder).toBe("asc");
});