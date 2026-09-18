import { expect, test } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserForm } from "./user-form";
import { ApiError } from "@/lib/api/error";

test("renders default values", () => {
  const { getByLabelText } = render(
    <UserForm
      submitLabel="Save"
      defaultValues={{
        name: "John Doe",
        email: "john@example.com",
      }}
      onSubmit={async () => {}}
    />,
  );

  expect(getByLabelText("Name")).toHaveValue("John Doe");

  expect(getByLabelText("Email")).toHaveValue("john@example.com");
});

test("submits valid values", async () => {
  const user = userEvent.setup();

  let submitted:
    | {
        name: string;
        email: string;
      }
    | undefined;

  const { getByLabelText, getByRole } = render(
    <UserForm
      submitLabel="Create user"
      onSubmit={async (input) => {
        submitted = input;
      }}
    />,
  );

  await user.type(getByLabelText("Name"), "John Doe");

  await user.type(getByLabelText("Email"), "john@example.com");

  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  await waitFor(() => {
    expect(submitted).toEqual({
      name: "John Doe",
      email: "john@example.com",
    });
  });
});

test("normalizes values before submitting", async () => {
  const user = userEvent.setup();

  let submitted:
    | {
        name: string;
        email: string;
      }
    | undefined;

  const { getByLabelText, getByRole } = render(
    <UserForm
      submitLabel="Create user"
      onSubmit={async (input) => {
        submitted = input;
      }}
    />,
  );

  await user.type(getByLabelText("Name"), "  John Doe  ");

  await user.type(getByLabelText("Email"), "  JOHN@EXAMPLE.COM  ");

  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  await waitFor(() => {
    expect(submitted).toEqual({
      name: "John Doe",
      email: "john@example.com",
    });
  });
});

test("does not submit invalid email", async () => {
  const user = userEvent.setup();

  let submitCount = 0;

  const { getByLabelText, getByRole, getByText } = render(
    <UserForm
      submitLabel="Create user"
      onSubmit={async () => {
        submitCount += 1;
      }}
    />,
  );

  await user.type(getByLabelText("Name"), "John Doe");

  await user.type(getByLabelText("Email"), "not-an-email");

  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  await waitFor(() => {
    expect(getByText("Email is invalid")).toBeInTheDocument();
  });

  expect(submitCount).toBe(0);
});

test("shows validation error for empty name", async () => {
  const user = userEvent.setup();

  const { getByLabelText, getByRole, getByText } = render(
    <UserForm submitLabel="Create user" onSubmit={async () => {}} />,
  );

  await user.type(getByLabelText("Email"), "john@example.com");

  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  await waitFor(() => {
    expect(getByText("Name is required")).toBeInTheDocument();
  });
});

test("shows server email error inline", async () => {
  const user = userEvent.setup();

  const { getByLabelText, getByRole, getByText } = render(
    <UserForm
      submitLabel="Create user"
      onSubmit={async () => {
        throw new ApiError(
          "EMAIL_ALREADY_EXISTS",
          "Email already exists",
          409,
          {
            email: "Email already exists",
          },
        );
      }}
    />,
  );

  await user.type(getByLabelText("Name"), "John Doe");

  await user.type(getByLabelText("Email"), "john@example.com");

  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  await waitFor(() => {
    expect(getByText("Email already exists")).toBeInTheDocument();
  });
});

test("maps duplicate email error to email field", async () => {
  const user = userEvent.setup();

  const { getByLabelText, getByRole, getByText } = render(
    <UserForm
      submitLabel="Create user"
      onSubmit={async () => {
        throw new ApiError("EMAIL_ALREADY_EXISTS", "Email already exists", 409);
      }}
    />,
  );

  await user.type(getByLabelText("Name"), "John Doe");

  await user.type(getByLabelText("Email"), "john@example.com");

  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  await waitFor(() => {
    expect(getByText("Email already exists")).toBeInTheDocument();
  });
});

test("shows form error for unexpected submit failure", async () => {
  const user = userEvent.setup();

  const { getByLabelText, getByRole, getByText } = render(
    <UserForm
      submitLabel="Create user"
      onSubmit={async () => {
        throw new Error("Network failure");
      }}
    />,
  );

  await user.type(getByLabelText("Name"), "John Doe");

  await user.type(getByLabelText("Email"), "john@example.com");

  await user.click(
    getByRole("button", {
      name: "Create user",
    }),
  );

  await waitFor(() => {
    expect(getByText("Something went wrong")).toBeInTheDocument();
  });
});