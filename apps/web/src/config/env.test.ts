import { describe, expect, test } from "bun:test";

import { parseFrontendEnv } from "./env";

describe("parseFrontendEnv", () => {
  test("returns valid frontend environment", () => {
    const result = parseFrontendEnv({
      VITE_API_URL: "http://localhost:3000",
    });

    expect(result).toEqual({
      VITE_API_URL: "http://localhost:3000",
    });
  });

  test("throws for invalid frontend environment", () => {
    expect(() =>
      parseFrontendEnv({
        VITE_API_URL: "not-a-url",
      }),
    ).toThrow("Invalid frontend environment");
  });

  test("allows VITE_API_URL to be omitted", () => {
    expect(parseFrontendEnv({})).toEqual({});
  });
});
