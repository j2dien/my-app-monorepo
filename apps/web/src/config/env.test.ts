import {
  describe,
  expect,
  spyOn,
  test,
} from "bun:test";

import {
  parseFrontendEnv,
} from "./env";

describe("parseFrontendEnv", () => {
  test("returns valid frontend environment", () => {
    const result = parseFrontendEnv({
      VITE_API_URL:
        "http://localhost:3000",
    });

    expect(result).toEqual({
      VITE_API_URL:
        "http://localhost:3000",
    });
  });

  test(
    "throws for invalid frontend environment",
    () => {
      const consoleError = spyOn(
        console,
        "error",
      ).mockImplementation(() => {});

      expect(() =>
        parseFrontendEnv({
          VITE_API_URL: undefined,
        }),
      ).toThrow(
        "Invalid frontend environment",
      );

      expect(consoleError)
        .toHaveBeenCalled();

      consoleError.mockRestore();
    },
  );
});