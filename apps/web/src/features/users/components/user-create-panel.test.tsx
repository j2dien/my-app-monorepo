import { expect, test } from "bun:test";
import { render } from "@testing-library/react";

import { UserCreatePanel } from "./user-create-panel";

test("renders create user panel", () => {
  const { getByText, getByRole } = render(
    <UserCreatePanel formKey={0} isPending={false} onSubmit={async () => {}} />,
  );

  expect(
    getByRole("heading", {
      name: "Create user",
    }),
  ).toBeInTheDocument();

  expect(getByText("Add a new user to the application.")).toBeInTheDocument();

  expect(
    getByRole("button", {
      name: "Create user",
    }),
  ).toBeInTheDocument();
});

test("shows creating label while mutation is pending", () => {
  const { getByRole } = render(
    <UserCreatePanel formKey={0} isPending onSubmit={async () => {}} />,
  );

  expect(
    getByRole("button", {
      name: "Creating...",
    }),
  ).toBeInTheDocument();
});
