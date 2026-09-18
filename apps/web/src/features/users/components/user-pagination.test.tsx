import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserPagination } from "./user-pagination";

test("renders pagination information", () => {
  const { getByText } = render(
    <UserPagination
      page={2}
      pageSize={20}
      total={73}
      totalPages={4}
      isPlaceholderData={false}
      onPageSizeChange={() => {}}
      onPreviousPage={() => {}}
      onNextPage={() => {}}
    />,
  );

  expect(getByText("73 users")).toBeInTheDocument();

  expect(getByText("Page 2 of 4")).toBeInTheDocument();
});

test("calls previous page callback", async () => {
  const user = userEvent.setup();

  let called = false;

  const { getByRole } = render(
    <UserPagination
      page={2}
      pageSize={20}
      total={73}
      totalPages={4}
      isPlaceholderData={false}
      onPageSizeChange={() => {}}
      onPreviousPage={() => {
        called = true;
      }}
      onNextPage={() => {}}
    />,
  );

  await user.click(
    getByRole("button", {
      name: "Previous",
    }),
  );

  expect(called).toBe(true);
});

test("calls next page callback", async () => {
  const user = userEvent.setup();

  let called = false;

  const { getByRole } = render(
    <UserPagination
      page={2}
      pageSize={20}
      total={73}
      totalPages={4}
      isPlaceholderData={false}
      onPageSizeChange={() => {}}
      onPreviousPage={() => {}}
      onNextPage={() => {
        called = true;
      }}
    />,
  );

  await user.click(
    getByRole("button", {
      name: "Next",
    }),
  );

  expect(called).toBe(true);
});

test("disables previous button on first page", () => {
  const { getByRole } = render(
    <UserPagination
      page={1}
      pageSize={20}
      total={73}
      totalPages={4}
      isPlaceholderData={false}
      onPageSizeChange={() => {}}
      onPreviousPage={() => {}}
      onNextPage={() => {}}
    />,
  );

  expect(
    getByRole("button", {
      name: "Previous",
    }),
  ).toBeDisabled();
});

test("disables next button on last page", () => {
  const { getByRole } = render(
    <UserPagination
      page={4}
      pageSize={20}
      total={73}
      totalPages={4}
      isPlaceholderData={false}
      onPageSizeChange={() => {}}
      onPreviousPage={() => {}}
      onNextPage={() => {}}
    />,
  );

  expect(
    getByRole("button", {
      name: "Next",
    }),
  ).toBeDisabled();
});

test("disables pagination while placeholder data is shown", () => {
  const { getByRole } = render(
    <UserPagination
      page={2}
      pageSize={20}
      total={73}
      totalPages={4}
      isPlaceholderData={true}
      onPageSizeChange={() => {}}
      onPreviousPage={() => {}}
      onNextPage={() => {}}
    />,
  );

  expect(
    getByRole("button", {
      name: "Previous",
    }),
  ).toBeDisabled();

  expect(
    getByRole("button", {
      name: "Next",
    }),
  ).toBeDisabled();
});

test("calls page size callback with selected value", async () => {
  const user = userEvent.setup();

  let selectedPageSize: number | undefined;

  const { getByRole } = render(
    <UserPagination
      page={1}
      pageSize={20}
      total={73}
      totalPages={4}
      isPlaceholderData={false}
      onPageSizeChange={(pageSize) => {
        selectedPageSize = pageSize;
      }}
      onPreviousPage={() => {}}
      onNextPage={() => {}}
    />,
  );

  const select = getByRole("combobox");

  await user.selectOptions(select, "50");

  expect(selectedPageSize).toBe(50);
});