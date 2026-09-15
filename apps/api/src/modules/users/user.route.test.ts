import { describe, expect, test } from "bun:test";

import { app } from "../../app";

type ValidationErrorBody = {
  error: {
    code: string;
    message: string;
    fields: Record<string, string>;
  };
};

describe("users API", () => {
  test("POST /users rejects invalid body", async () => {
    const response = await app.request("/api/v1/users", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: "",
        email: "invalid-email",
      }),
    });

    expect(response.status).toBe(400);

    const body = (await response.json()) as ValidationErrorBody;

    expect(body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
      },
    });

    expect(body.error.fields).toMatchObject({
      name: "Name is required",
      email: "Email is invalid",
    });
  });

  test("GET /users/:id rejects invalid UUID", async () => {
    const response = await app.request("/api/v1/users/not-a-uuid");

    expect(response.status).toBe(400);

    const body = (await response.json()) as ValidationErrorBody;

    expect(body.error.code).toBe("VALIDATION_ERROR");

    expect(body.error.fields).toHaveProperty("id");
  });
});
