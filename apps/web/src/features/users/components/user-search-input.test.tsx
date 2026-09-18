import { expect, test } from "bun:test";
import { act, render, screen, waitFor } from "@testing-library/react";
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

test("submits search after debounce", async () => {
  const user = userEvent.setup();

  let submittedValue: string | undefined;

  render(
    <UserSearchInput
      initialValue=""
      currentSearch={undefined}
      onSearchChange={(value) => {
        submittedValue = value;
      }}
    />,
  );

  const input = screen.getByRole("searchbox");

  await user.type(input, "john");

  /*
   * Belum boleh langsung submit,
   * karena debounce 400ms.
   */
  expect(submittedValue).toBeUndefined();

  await waitFor(
    () => {
      expect(submittedValue).toBe("john");
    },
    {
      timeout: 1000,
    },
  );
});

test("clear is not overwritten by a stale debounced search", async () => {
  const user = userEvent.setup();

  const submittedValues: Array<string | undefined> = [];

  function handleSearchChange(value: string | undefined) {
    submittedValues.push(value);
  }

  const { rerender } = render(
    <UserSearchInput
      initialValue=""
      currentSearch={undefined}
      onSearchChange={handleSearchChange}
    />,
  );

  const input = screen.getByRole("searchbox");

  await user.type(input, "john");

  await waitFor(
    () => {
      expect(submittedValues).toContain("john");
    },
    {
      timeout: 1000,
    },
  );

  /*
   * Simulasikan router selesai
   * mengubah URL menjadi:
   *
   * ?search=john
   */
  rerender(
    <UserSearchInput
      initialValue="john"
      currentSearch="john"
      onSearchChange={handleSearchChange}
    />,
  );

  await user.click(
    screen.getByRole("button", {
      name: "Clear",
    }),
  );

  expect(input).toHaveValue("");

  /*
   * Clear harus langsung mengirim
   * undefined.
   */
  expect(submittedValues.at(-1)).toBeUndefined();

  /*
   * Beri waktu melewati debounce.
   *
   * Nilai lama "john" tidak boleh
   * disubmit ulang.
   */
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  expect(submittedValues.at(-1)).toBeUndefined();
});

test("trims search before submitting", async () => {
  const user = userEvent.setup();

  let submittedValue: string | undefined;

  render(
    <UserSearchInput
      initialValue=""
      currentSearch={undefined}
      onSearchChange={(value) => {
        submittedValue = value;
      }}
    />,
  );

  await user.type(screen.getByRole("searchbox"), "  john  ");

  await waitFor(
    () => {
      expect(submittedValue).toBe("john");
    },
    {
      timeout: 1000,
    },
  );
});

test("treats whitespace-only search as empty", async () => {
  const user = userEvent.setup();

  const values: Array<string | undefined> = [];

  render(
    <UserSearchInput
      initialValue="john"
      currentSearch="john"
      onSearchChange={(value) => {
        values.push(value);
      }}
    />,
  );

  const input = screen.getByRole("searchbox");

  await user.clear(input);

  await user.type(input, "   ");

  await waitFor(
    () => {
      expect(values.at(-1)).toBeUndefined();
    },
    {
      timeout: 1000,
    },
  );
});
